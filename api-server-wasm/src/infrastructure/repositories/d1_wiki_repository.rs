use crate::domain::entities::wiki::Wikis;
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::wiki_repository::WikiRepository;
use crate::async_trait::async_trait;
use worker::{D1Database, Result};
use std::sync::Arc;

pub struct D1WikiRepository {
    db: Arc<D1Database>,
}

impl D1WikiRepository {
    pub fn new(db: D1Database) -> Self {
        Self { db: Arc::new(db) }
    }
}

#[async_trait(?Send)]
impl WikiRepository for D1WikiRepository {
    async fn get_wikis(&self) -> Result<Vec<Wikis>> {
        let query = self.db.prepare("select * from wikis order by id desc");
        let result = query.all().await?;
        result.results::<Wikis>()
    }

    async fn get_wiki_by_id(&self, id: u32) -> Result<Wikis> {
        let statement = self.db.prepare("select * from wikis where id = ?1");
        let query = statement.bind(&[id.into()])?;
        let result = query.first::<Wikis>(None).await?;
        match result {
            Some(wiki) => Ok(wiki),
            None => Err(worker::Error::RustError(format!("A wiki with id {} is not found.", id)))
        }
    }

    async fn create_wiki(&self, wiki: &Wikis) -> Result<()> {
        let statement = self.db.prepare("insert into wikis (title, content, created_by, updated_at, image_url, version) values (?1, ?2, ?3, ?4, ?5, ?6)");
        let query = statement.bind(&[wiki.title.clone().into(),
                                                          wiki.content.clone().into(),
                                                          wiki.created_by.into(),
                                                          wiki.updated_at.clone().into(),
                                                          wiki.image_url.clone().into(),
                                                          wiki.version.into()])?;
        
        query.run().await?;
        Ok(())
    }

    async fn update_wiki(&self, wiki: &mut Wikis) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from wikis where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[wiki.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        if let Some(latest) = fetch_version_result {
            if wiki.version == latest.version {
                wiki.version += 1;
            } else {
                return Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
            }
        } else {
            return Err(worker::Error::RustError("Version is found None".to_string()))
        }
        let statement = self.db.prepare("update wikis set title = ?1, content = ?2, created_by = ?3, updated_at = ?4, image_url = ?5, version = ?6 where id = ?7");
        let query = statement.bind(&[wiki.title.clone().into(),
                                                          wiki.content.clone().into(),
                                                          wiki.created_by.into(),
                                                          wiki.updated_at.clone().into(),
                                                          wiki.image_url.clone().into(),
                                                          wiki.version.into(),
                                                          wiki.id.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn delete_wiki(&self, wiki: &mut Wikis) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from wikis where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[wiki.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        if let Some(latest) = fetch_version_result {
            if wiki.version == latest.version {
                wiki.version += 1;
            } else {
                return Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
            }
        } else {
            return Err(worker::Error::RustError("Version is found None".to_string()))
        }
        let statement = self.db.prepare("delete from wikis where id = ?1");
        let query = statement.bind(&[wiki.id.into()])?;
        query.run().await?;
        Ok(())
    }
}