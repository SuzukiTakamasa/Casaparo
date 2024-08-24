use crate::domain::entities::schedule::Schedules;
use crate::domain::repositories::schedule_repository::ScheduleRepository;
use worker::Result;

pub struct ScheduleUsecases<R: ScheduleRepository> {
    repository: R,
}

impl<R: ScheduleRepository> ScheduleUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_schedules(&self) -> Result<Vec<Schedules>> {
        self.repository.get_schedules().await
    }

    pub async fn get_today_or_tomorrow_schedules(&self, year: u16, month: u8, day: u8) -> Result<Vec<Schedules>> {
        self.repository.get_today_or_tomorrow_schedules(year, month, day).await
    }

    pub async fn create_schedule(&self, schedule: &Schedules) -> Result<()> {
        self.repository.create_schedule(schedule).await
    }

    pub async fn update_schedule(&self, schedule: &mut Schedules) -> Result<()> {
        self.repository.update_schedule(schedule).await
    }

    pub async fn delete_schedule(&self, schedule: &mut Schedules) -> Result<()> {
        self.repository.delete_schedule(schedule).await
    }
}