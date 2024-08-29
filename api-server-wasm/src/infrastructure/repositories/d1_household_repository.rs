use crate::domain::entities::household::{Households, FixedAmount, IsCompleted, HouseholdMonthlySummary, CompletedHouseholds};
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::household_repository::HouseholdRepository;
use crate::async_trait::async_trait;
use worker::{D1Database, Result};
use std::sync::Arc;

pub struct D1HouseholdRepository {
    db: Arc<D1Database>
}

impl D1HouseholdRepository {
    pub fn new(db: Arc<D1Database>) -> Self {
        Self { db }
    }
}

#[async_trait(?Send)]
impl HouseholdRepository for D1HouseholdRepository {
    async fn get_households(&self, year: u16, month: u8) -> Result<Vec<Households>> {
        let statement = self.db.prepare("select * from households where ( year = ?1 and month = ?2 ) or is_default = 1 order by is_default desc");
        let query = statement.bind(&[year.into(), month.into()])?;
        let result = query.all().await?;
        result.results::<Households>()
    }

    async fn get_fixed_amount(&self, year: u16, month: u8) -> Result<FixedAmount> {
        let statement = self.db.prepare("select sum(case when is_owner = 1 then amount else -amount end) as billing_amount, sum(amount) as total_amount from households where ( year = ?1 and month = ?2 ) or is_default = 1");
        let query = statement.bind(&[year.into(), month.into()])?;
        let result = query.first::<FixedAmount>(None).await?;
        match result {
            Some(fixed_amount) => Ok(fixed_amount),
            None => Err(worker::Error::RustError("Failed to fetch fixed amount".to_string()))
        }
    }

    async fn get_completed_households(&self, year: u16, month: u8) -> Result<IsCompleted> {
        let statement = self.db.prepare("select case when exists (select * from completed_households where year = ?1 and month = ?2) then 1 else 0 end as is_completed");
        let query = statement.bind(&[year.into(), month.into()])?;
        let result = query.first::<IsCompleted>(None).await?;
        match result {
            Some(is_completed) => Ok(is_completed),
            None => Err(worker::Error::RustError("Failed to fetch is completed".to_string()))
        }
    }

    async fn get_completed_households_monthly_summary(&self, year: u16) -> Result<Vec<HouseholdMonthlySummary>> {
        let statement = self.db.prepare("select month, billing_amount, total_amount from completed_households where year = ?1");
        let query = statement.bind(&[year.into()])?;
        let result = query.all().await?;
        result.results::<HouseholdMonthlySummary>()
    }

    async fn create_household(&self, household: &Households) -> Result<()> {
        let statement = self.db.prepare("insert into households (name, amount, year, month, is_default, is_owner, version) values (?1, ?2, ?3, ?4, ?5, ?6, ?7)");
        let query = statement.bind(&[household.name.clone().into(),
                                     household.amount.into(),
                                     household.year.into(),
                                     household.month.into(),
                                     household.is_default.into(),
                                     household.is_owner.into(),
                                     household.version.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn update_household(&self, household: &mut Households) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from households where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[household.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;

        if let Some(latest) = fetch_version_result {
            if household.version == latest.version {
                household.version += 1;
            } else {
                return Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
            }
        } else {
            return Err(worker::Error::RustError("Version is found None".to_string()))
        }
        let statement = self.db.prepare("update households set name = ?1, amount = ?2, is_default = ?3, is_owner = ?4, version = ?5 where id = ?6");
        let query = statement.bind(&[household.name.clone().into(),
                                     household.amount.into(),
                                     household.is_default.into(),
                                     household.is_owner.into(),
                                     household.version.into(),
                                     household.id.into()])?;
        query.run().await?;
        Ok(())
    }


    async fn delete_household(&self, household: &mut Households) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from households where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[household.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;

        if let Some(latest) = fetch_version_result {
            if household.version == latest.version {
                household.version += 1;
            } else {
                return Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
            }
        } else {
            return Err(worker::Error::RustError("Version is found None".to_string()))
        }
        let statement = self.db.prepare("delete from households where id = ?1");
        let query = statement.bind(&[household.id.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn create_completed_household(&self, completed_household: &CompletedHouseholds) -> Result<()> {
        let statement = self.db.prepare("insert into completed_households (year, month, detail, billing_amount, total_amount) values (?1, ?2, ?3, ?4, ?5)");
        let query = statement.bind(&[completed_household.year.into(),
                                     completed_household.month.into(),
                                     completed_household.detail.clone().into(),
                                     completed_household.billing_amount.into(),
                                     completed_household.total_amount.into()])?;
        query.run().await?;
        Ok(())
    }
}