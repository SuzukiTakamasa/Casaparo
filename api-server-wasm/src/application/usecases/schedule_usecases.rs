use crate::domain::entities::schedule::Schedules;
use crate::domain::repositories::schedule_repository::ScheduleRepository;
use crate::service::validators::common_validators::{validate_year, validate_month, validate_date};
use crate::worker_err;
use worker::Result;

pub struct ScheduleUsecases<R: ScheduleRepository> {
    repository: R,
}

impl Schedules {
    fn validate(&self) -> Result<()> {
        validate_year(self.from_year)?;
        validate_year(self.to_year)?;
        validate_month(self.from_month)?;
        validate_month(self.to_month)?;
        validate_date(self.from_date)?;
        validate_date(self.to_date)?;
        if self.description.len() == 0 {
            return Err(worker_err!("The title must not be empty."));
        }
        if self.created_by == 0 || self.created_by == 1 {
            return Err(worker_err!("The created_by must be 0 or 1."));
        }
        Ok(())
    }
}

impl<R: ScheduleRepository> ScheduleUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_schedules(&self) -> Result<Vec<Schedules>> {
        self.repository.get_schedules().await
    }

    pub async fn get_today_or_tomorrow_schedules(&self, year: u16, month: u8, day: u8) -> Result<Vec<Schedules>> {
        validate_year(year)?;
        validate_month(month)?;
        validate_date(day)?;
        self.repository.get_today_or_tomorrow_schedules(year, month, day).await
    }

    pub async fn create_schedule(&self, schedule: &Schedules) -> Result<()> {
        schedule.validate()?;
        self.repository.create_schedule(schedule).await
    }

    pub async fn update_schedule(&self, schedule: &mut Schedules) -> Result<()> {
        schedule.validate()?;
        self.repository.update_schedule(schedule).await
    }

    pub async fn delete_schedule(&self, schedule: &mut Schedules) -> Result<()> {
        schedule.validate()?;
        self.repository.delete_schedule(schedule).await
    }
}