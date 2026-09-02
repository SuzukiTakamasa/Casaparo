use crate::domain::entities::shift::Shift;
use crate::domain::entities::shift::AnnualIncome;
use crate::async_trait::async_trait;
use worker::Result;

#[async_trait(?Send)]
pub trait ShiftRepository {
    async fn get_shifts(&self) -> Result<Vec<Shift>>;
    async fn get_shifts_by_year_month(&self, year: u32, month: u32) -> Result<Vec<Shift>>;
    async fn get_today_or_tomorrow_shifts(&self, year: u32, month: u32, day: u32) -> Result<Vec<Shift>>;
    async fn get_annual_income(&self, year: u32) -> Result<AnnualIncome>;
    async fn create_shift(&self, shift: &Shift) -> Result<()>;
    async fn update_shift(&self, shift: &mut Shift) -> Result<()>;
    async fn delete_shift(&self, shift: &mut Shift) -> Result<()>;
}
