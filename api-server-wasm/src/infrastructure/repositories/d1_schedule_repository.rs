use crate::domain::entities::schedule::Schedules;
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::schedule_repository::ScheduleRepository;
use crate::{optimistic_lock, worker_error};
use crate::async_trait::async_trait;
use worker::{D1Database, Result};
use std::sync::Arc;

pub struct D1ScheduleRepository {
    db: Arc<D1Database>,
}

impl D1ScheduleRepository {
    pub fn new(db: Arc<D1Database>) -> Self {
        Self { db }
    }
}

#[async_trait(?Send)]
impl ScheduleRepository for D1ScheduleRepository {
    async fn get_schedules(&self) -> Result<Vec<Schedules>> {
        let query = self.db.prepare(r#"select *
                                                            from (select schedules.*,
                                                                  case when label_id = 0
                                                                  then null
                                                                  else labels.label
                                                                  end as label
                                                                  from schedules
                                                                  left join labels
                                                                  on schedules.label_id = labels.id) as schedules
                                                            order by from_year, to_year, from_month, to_month, from_date, to_date asc"#);
        let result = query.all().await?;
        result.results::<Schedules>()
    }

    async fn get_today_or_tomorrow_schedules(&self, year: u16, month: u8, day: u8) -> Result<Vec<Schedules>> {
        let statement = self.db.prepare(r#"select *
                                                                from (select schedules.*,
                                                                      case when label_id = 0
                                                                      then null
                                                                      else labels.label
                                                                      end as label
                                                                      from schedules
                                                                      left join labels
                                                                      on schedules.label_id = labels.id
                                                                      where from_year = ?1 and from_month = ?2 and (from_date = ?3 or from_date = ?3 + 1)) as schedules
                                                                order by from_year, to_year, from_month, to_month, from_date, to_date asc"#);
        let query = statement.bind(&[year.into(),
                                                          month.into(),
                                                          day.into()])?;
        let result = query.all().await?;
        result.results::<Schedules>()
    }

    async fn create_schedule(&self, schedule: &Schedules) -> Result<()> {
        let statement = self.db.prepare(r#"insert into schedules
                                                                (description, from_year, to_year, from_month, to_month, from_date, to_date, from_time, to_time, created_by, label_id, version)
                                                                values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)"#);
        let query = statement.bind(&[schedule.description.clone().into(),
                                                          schedule.from_year.into(),
                                                          schedule.to_year.into(),
                                                          schedule.from_month.into(),
                                                          schedule.to_month.into(),
                                                          schedule.from_date.into(),
                                                          schedule.to_date.into(),
                                                          schedule.from_time.clone().into(),
                                                          schedule.to_time.clone().into(),
                                                          schedule.created_by.into(),
                                                          schedule.label_id.into(),
                                                          schedule.version.into()])?;

        query.run().await?;
        Ok(())
    }

    async fn update_schedule(&self, schedule: &mut Schedules) -> Result<()> {
        let fetch_version_statement = self.db.prepare(r#"select version
                                                                              from schedules
                                                                              where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[schedule.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, schedule);

        let statement = self.db.prepare(r#"update schedules
                                                                set description = ?1,
                                                                from_year = ?2,
                                                                to_year = ?3,
                                                                from_month = ?4,
                                                                to_month = ?5,
                                                                from_date = ?6,
                                                                to_date = ?7,
                                                                from_time = ?8,
                                                                to_time = ?9,
                                                                created_by = ?10,
                                                                label_id = ?11,
                                                                version = ?12
                                                                where id = ?13"#);
        let query = statement.bind(&[schedule.description.clone().into(),
                                                          schedule.from_year.into(),
                                                          schedule.to_year.into(),
                                                          schedule.from_month.into(),
                                                          schedule.to_month.into(),
                                                          schedule.from_date.into(),
                                                          schedule.to_date.into(),
                                                          schedule.from_time.clone().into(),
                                                          schedule.to_time.clone().into(),
                                                          schedule.created_by.into(),
                                                          schedule.label_id.into(),
                                                          schedule.version.into(),
                                                          schedule.id.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn delete_schedule(&self, schedule: &mut Schedules) -> Result<()> {
        let fetch_version_statement = self.db.prepare(r#"select version
                                                                              from schedules
                                                                              where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[schedule.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, schedule);
        
        let statement = self.db.prepare(r#"delete
                                                                from schedules
                                                                where id = ?1"#);
        let query = statement.bind(&[schedule.id.into()])?;
        query.run().await?;
        Ok(())
    }
}