use crate::domain::entities::shift::Shift;
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::shift_repository::ShiftRepository;
use crate::{optimistic_lock, worker_error};
use crate::async_trait::async_trait;
use worker::wasm_bindgen::JsValue;
use worker::{D1Database, Result};
use std::sync::Arc;

/// `Option::<u32>::None` converts to `undefined`, which D1 rejects, so absent
/// values have to be bound as SQL NULL instead.
fn to_nullable(value: Option<u32>) -> JsValue {
    match value {
        Some(v) => v.into(),
        None => JsValue::NULL,
    }
}

pub struct D1ShiftRepository {
    db: Arc<D1Database>,
}

impl D1ShiftRepository {
    pub fn new(db: Arc<D1Database>) -> Self {
        Self { db }
    }
}

#[async_trait(?Send)]
impl ShiftRepository for D1ShiftRepository {
    async fn get_shifts(&self) -> Result<Vec<Shift>> {
        let query = self.db.prepare(r#"select *
                                       from shifts
                                       order by year asc, month asc, date asc, id asc"#);
        let result = query.all().await?;
        result.results::<Shift>()
    }

    async fn get_shifts_by_year_month(&self, year: u32, month: u32) -> Result<Vec<Shift>> {
        let statement = self.db.prepare(r#"select *
                                           from shifts
                                           where year = ?1
                                           and month = ?2
                                           order by date asc, id asc"#);
        let query = statement.bind(&[year.into(), month.into()])?;
        let result = query.all().await?;
        result.results::<Shift>()
    }

    async fn create_shift(&self, shift: &Shift) -> Result<()> {
        let statement = self.db.prepare(r#"insert into shifts
                                           (year, month, date, work, working_hour_from, working_hour_to, hourly_wage, transportation_expense, version)
                                           values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)"#);
        let query = statement.bind(&[
            shift.year.into(),
            shift.month.into(),
            shift.date.into(),
            shift.work.clone().into(),
            shift.working_hour_from.into(),
            shift.working_hour_to.into(),
            shift.hourly_wage.into(),
            shift.transportation_expense.into(),
            shift.version.into(),
        ])?;
        query.run().await?;
        Ok(())
    }

    async fn update_shift(&self, shift: &mut Shift) -> Result<()> {
        let fetch_version_statement = self.db.prepare(r#"select version
                                                          from shifts
                                                          where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[shift.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, shift);

        let statement = self.db.prepare(r#"update shifts
                                           set year = ?1,
                                           month = ?2,
                                           date = ?3,
                                           work = ?4,
                                           working_hour_from = ?5,
                                           working_hour_to = ?6,
                                           hourly_wage = ?7,
                                           transportation_expense = ?8,
                                           version = ?9
                                           where id = ?10"#);
        let query = statement.bind(&[
            shift.year.into(),
            shift.month.into(),
            shift.date.into(),
            shift.work.clone().into(),
            shift.working_hour_from.into(),
            shift.working_hour_to.into(),
            shift.hourly_wage.into(),
            shift.transportation_expense.into(),
            shift.version.into(),
            shift.id.into(),
        ])?;
        query.run().await?;
        Ok(())
    }

    async fn delete_shift(&self, shift: &mut Shift) -> Result<()> {
        let fetch_version_statement = self.db.prepare(r#"select version
                                                          from shifts
                                                          where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[shift.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, shift);

        let statement = self.db.prepare(r#"delete
                                           from shifts
                                           where id = ?1"#);
        let query = statement.bind(&[shift.id.into()])?;
        query.run().await?;
        Ok(())
    }

    /// Rebuilds `shifts` so that the working hour columns are declared as REAL,
    /// then re-inserts the rows the caller fetched beforehand. SQLite cannot
    /// change a column type in place, so the old table is kept under
    /// `shifts_old` until every row has been restored: if the insert fails the
    /// data is still recoverable from there.
    async fn migrate_schema(&self, shifts: &[Shift]) -> Result<()> {
        self.db.prepare("drop table if exists shifts_old").run().await?;
        self.db.prepare("alter table shifts rename to shifts_old").run().await?;
        self.db.prepare(r#"create table shifts (
                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                           year INTEGER NOT NULL,
                           month INTEGER NOT NULL,
                           date INTEGER NOT NULL,
                           work TEXT NOT NULL,
                           working_hour_from REAL NOT NULL,
                           working_hour_to REAL NOT NULL,
                           hourly_wage INTEGER NOT NULL,
                           transportation_expense INTEGER DEFAULT NULL,
                           version INTEGER NOT NULL
                           )"#).run().await?;

        if !shifts.is_empty() {
            let mut query_lists = Vec::with_capacity(shifts.len());
            for shift in shifts {
                let statement = self.db.prepare(r#"insert into shifts
                                                   (id, year, month, date, work, working_hour_from, working_hour_to, hourly_wage, transportation_expense, version)
                                                   values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)"#);
                let query = statement.bind(&[
                    to_nullable(shift.id),
                    shift.year.into(),
                    shift.month.into(),
                    shift.date.into(),
                    shift.work.clone().into(),
                    shift.working_hour_from.into(),
                    shift.working_hour_to.into(),
                    shift.hourly_wage.into(),
                    to_nullable(shift.transportation_expense),
                    shift.version.into(),
                ])?;
                query_lists.push(query);
            }
            self.db.batch(query_lists).await?;
        }

        self.db.prepare("drop table shifts_old").run().await?;
        Ok(())
    }
}
