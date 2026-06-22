use crate::domain::entities::shift::Shift;
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::shift_repository::ShiftRepository;
use crate::{optimistic_lock, worker_error};
use crate::async_trait::async_trait;
use worker::{D1Database, Result};
use std::sync::Arc;

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
}
