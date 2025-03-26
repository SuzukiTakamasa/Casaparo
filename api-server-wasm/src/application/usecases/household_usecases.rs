use crate::domain::entities::household::{Households, FixedAmount, HouseholdMonthlySummary, IsCompleted, CompletedHouseholds};
use crate::domain::repositories::household_repository::HouseholdRepository;
use crate::service::validators::common_validators::{validate_year, validate_month};
use crate::worker_err;
use worker::Result;

pub struct HouseholdUsecases<R: HouseholdRepository> {
    repository: R
}

impl Households {
    fn validate(&self) -> Result<()> {
        if self.name.len() == 0 {
            return Err(worker::Error::RustError("The name must not be empty.".to_string()));
        }
        if let Some(year) = self.year {
            validate_year(year)?;
        }
        if let Some(month) = self.month {
            validate_month(month)?;
        }
        if self.is_default != 0 || self.is_default != 1 {
            return Err(worker_err!("The is_default must be 0 or 1."));
        }
        if self.is_owner != 0 || self.is_owner != 1 {
            return Err(worker_err!("The is_owner must be 0 or 1."));
        }
        Ok(())
    }
}

impl CompletedHouseholds {
    fn validate(&self) -> Result<()> {
        validate_year(self.year)?;
        validate_month(self.month)?;
        if self.detail.len() == 0 {
            return Err(worker_err!("The detail must not be empty."));
        }
        Ok(())
    }
}

impl<R: HouseholdRepository> HouseholdUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_households(&self, year: u16, month: u8) -> Result<Vec<Households>> {
        validate_year(year)?;
        validate_month(month)?;
        self.repository.get_households(year, month).await
    }

    pub async fn get_fixed_amount(&self, year: u16, month: u8) -> Result<FixedAmount> {
        validate_year(year)?;
        validate_month(month)?;
        self.repository.get_fixed_amount(year, month).await
    }

    pub async fn get_completed_households(&self, year: u16, month: u8) -> Result<IsCompleted> {
        validate_year(year)?;
        validate_month(month)?;
        self.repository.get_completed_households(year, month).await
    }

    pub async fn get_completed_households_monthly_summary(&self, year: u16) -> Result<Vec<HouseholdMonthlySummary>> {
        validate_year(year)?;
        self.repository.get_completed_households_monthly_summary(year).await
    }

    pub async fn get_completed_households_monthly_summary_by_month(&self, year: u16, month: u8) -> Result<Vec<HouseholdMonthlySummary>> {
        validate_year(year)?;
        validate_month(month)?;
        self.repository.get_completed_households_monthly_summary_by_month(year, month).await
    }

    pub async fn create_household(&self, household: &Households) -> Result<()> {
        household.validate()?;
        self.repository.create_household(household).await
    }

    pub async fn update_household(&self, household: &mut Households) -> Result<()> {
        household.validate()?;
        self.repository.update_household(household).await
    }

    pub async fn delete_household(&self, household: &mut Households) -> Result<()> {
        household.validate()?;
        self.repository.delete_household(household).await
    }

    pub async fn create_completed_household(&self, completed_household: &CompletedHouseholds) -> Result<()> {
        completed_household.validate()?;
        self.repository.create_completed_household(completed_household).await
    }
 }