use crate::domain::entities::household::{Households, FixedAmount, HouseholdMonthlySummary, IsCompleted, CompletedHouseholds};
use crate::domain::repositories::household_repository::HouseholdRepository;
use worker::Result;

pub struct HouseholdUsecases<R: HouseholdRepository> {
    repository: R
}

impl<R: HouseholdRepository> HouseholdUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_households(&self, year: u16, month: u8) -> Result<Vec<Households>> {
        self.repository.get_households(year, month).await
    }

    pub async fn get_fixed_amount(&self, year: u16, month: u8) -> Result<FixedAmount> {
        self.repository.get_fixed_amount(year, month).await
    }

    pub async fn get_completed_households(&self, year: u16, month: u8) -> Result<IsCompleted> {
        self.repository.get_completed_households(year, month).await
    }

    pub async fn get_completed_households_monthly_summary(&self, year: u16) -> Result<Vec<HouseholdMonthlySummary>> {
        self.repository.get_completed_households_monthly_summary(year).await
    }

    pub async fn create_household(&self, household: &Households) -> Result<()> {
        self.repository.create_household(household).await
    }

    pub async fn update_household(&self, household: &mut Households) -> Result<()> {
        self.repository.update_household(household).await
    }

    pub async fn delete_household(&self, household: &mut Households) -> Result<()> {
        self.repository.delete_household(household).await
    }

    pub async fn create_completed_household(&self, completed_household: &CompletedHouseholds) -> Result<()> {
        self.repository.create_completed_household(completed_household).await
    }
 }