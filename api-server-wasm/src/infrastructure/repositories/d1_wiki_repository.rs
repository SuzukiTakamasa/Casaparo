use crate::domain::entities::wiki::Wikis;
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::wiki_repository::WikiRepository;
use crate::{optimistic_lock, worker_error};
use crate::async_trait::async_trait;
use worker::{D1Database, Result};
use std::sync::Arc;

pub struct D1WikiRepository {
    db: Arc<D1Database>,
}

impl D1WikiRepository {
    pub fn new(db: Arc<D1Database>) -> Self {
        Self { db }
    }
}

#[async_trait(?Send)]
impl WikiRepository for D1WikiRepository {
    async fn get_wikis(&self) -> Result<Vec<Wikis>> {
        let query = self.db.prepare(r#"select *
                                                            from wikis
                                                            order by id desc"#);
        let result = query.all().await?;
        result.results::<Wikis>()
    }

    async fn get_wiki_by_id(&self, id: u32) -> Result<Wikis> {
        let statement = self.db.prepare(r#"select *
                                                                from wikis
                                                                where id = ?1"#);
        let query = statement.bind(&[id.into()])?;
        let result = query.first::<Wikis>(None).await?;
        match result {
            Some(wiki) => Ok(wiki),
            None => worker_error!(format!("A wiki with id {} is not found.", id))
        }
    }

    async fn create_wiki(&self, wiki: &Wikis) -> Result<()> {
        let statement = self.db.prepare(r#"insert into wikis
                                                                (title, content, created_by, updated_at, image_url, version)
                                                                values (?1, ?2, ?3, ?4, ?5, ?6)"#);
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
        let fetch_version_statement = self.db.prepare(r#"select version
                                                                              from wikis
                                                                              where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[wiki.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, wiki);

        let statement = self.db.prepare(r#"update wikis
                                                                set title = ?1,
                                                                content = ?2,
                                                                created_by = ?3,
                                                                updated_at = ?4,
                                                                image_url = ?5,
                                                                version = ?6
                                                                where id = ?7"#);
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
        let fetch_version_statement = self.db.prepare(r#"select version
                                                                              from wikis
                                                                              where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[wiki.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, wiki);
        
        let statement = self.db.prepare(r#"delete
                                                                from wikis
                                                                where id = ?1"#);
        let query = statement.bind(&[wiki.id.into()])?;
        query.run().await?;
        Ok(())
    }
}