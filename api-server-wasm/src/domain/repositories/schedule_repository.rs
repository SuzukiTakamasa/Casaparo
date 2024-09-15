use crate::domain::entities::schedule::Schedules;
use crate::async_trait::async_trait;
use worker::Result;

#[async_trait(?Send)]
pub trait ScheduleRepository {
    async fn get_schedules(&self) -> Result<Vec<Schedules>>;
    async fn get_today_or_tomorrow_schedules(&self, year: u16, month: u8, day: u8) -> Result<Vec<Schedules>>;
    async fn create_schedule(&self, schedule: &Schedules) -> Result<()>;
    async fn update_schedule(&self, schedule: &mut Schedules) -> Result<()>;
    async fn delete_schedule(&self, schedule: &mut Schedules) -> Result<()>;
}