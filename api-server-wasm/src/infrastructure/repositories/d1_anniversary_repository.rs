use crate::domain::entities::setting::Anniversaries;
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::anniversary_repository::AnniversaryRepository;
use crate::async_trait::async_trait;
use worker::{D1Database, Result};
use std::sync::Arc;

pub struct D1AnniversaryRepository {
    db: Arc<D1Database>,
}

impl D1AnniversaryRepository {
    pub fn new(db: Arc<D1Database>) -> Self {
        Self { db }
    }
}

#[async_trait(?Send)]
impl AnniversaryRepository for D1AnniversaryRepository {
    async fn get_anniversaries(&self) -> Result<Vec<Anniversaries>> {
        let query = self.db.prepare("select * from anniversaries order by id desc");
        let result = query.all().await?;
        result.results::<Anniversaries>()
    }

    async fn create_anniversary(&self, anniversary: &Anniversaries) -> Result<()> {
        let statement = self.db.prepare("insert into anniversaries (month, date, description, version) values (?1, ?2, ?3, ?4)");
        let query = statement.bind(&[anniversary.month.into(),
                                                          anniversary.date.into(),
                                                          anniversary.description.clone().into(),
                                                          anniversary.version.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn update_anniversary(&self, anniversary: &mut Anniversaries) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from anniversaries where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[anniversary.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        if let Some(latest) = fetch_version_result {
            if anniversary.version == latest.version {
                anniversary.version += 1;
            } else {
                return Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
            }
        } else {
            return Err(worker::Error::RustError("Version is found None".to_string()))
        }
        let statement = self.db.prepare("update anniversaries set month = ?1, date = ?2, description = ?3, version = ?4 where id = ?5");
        let query = statement.bind(&[anniversary.month.into(),
                                                          anniversary.date.into(),
                                                          anniversary.description.clone().into(),
                                                          anniversary.version.into(),
                                                          anniversary.id.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn delete_anniversary(&self, anniversary: &mut Anniversaries) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from anniversaries where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[anniversary.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        if let Some(latest) = fetch_version_result {
            if anniversary.version == latest.version {
                anniversary.version += 1;
            } else {
                return Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
            }
        } else {
            return Err(worker::Error::RustError("Version is found None".to_string()))
        }
        let statement = self.db.prepare("delete from anniversaries where id = ?1");
        let query = statement.bind(&[anniversary.id.into()])?;
        query.run().await?;
        Ok(())
    }
}