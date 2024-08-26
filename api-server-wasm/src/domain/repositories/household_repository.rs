use crate::domain::entities::household::{Households, FixedAmount, HouseholdMonthlySummary, IsCompleted};
use crate::async_trait::async_trait;
use worker::Result;

#[async_trait(?Send)]
pub trait HouseholdRepository {
    async fn get_households(&self) -> Result<Vec<Households>>;
    async fn get_fixed_amount(&self, year: u16, month: u8) -> Result<Vec<FixedAmount>>;
    async fn get_completed_households(&self, year: u16, month: u8) -> Result<Vec<IsCompleted>>;
    async fn get_completed_households_monthly_summary(&self, year: u16) -> Result<Vec<HouseholdMonthlySummary>>;
    async fn create_household(&self, household: &Households) -> Result<()>;
    async fn update_household(&self, household: &mut Households) -> Result<()>;
    async fn delete_household(&self, household: &mut Households) -> Result<()>;
}