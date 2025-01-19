use crate::domain::entities::wiki_image::WikiImages;
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::wiki_image_repository::WikiImageRepository;
use crate::async_trait::async_trait;
use worker::{D1Database, Result};
use std::sync::Arc;

pub struct D1WikiImageRepository {
    db: Arc<D1Database>,
}

impl D1WikiImageRepository {
    pub fn new(db: Arc<D1Database>) -> Self {
        Self { db }
    }
}

#[async_trait(?Send)]
impl WikiImageRepository for D1WikiImageRepository {
    async fn get_wiki_images_by_id(&self, id: u32) -> Result<Vec<WikiImages>> {
        let query = self.db.prepare("select * from wiki_images where wiki_id = ?1 order by id desc");
        let result = query.bind(&[id.into()])?.all().await?;
        result.results::<WikiImages>()
    }

    async fn create_wiki_image(&self, wiki_image: &WikiImages) -> Result<()> {
        let statement = self.db.prepare("insert into wiki_images (wiki_id, image_url, version) values (?1, ?2, ?3)");
        let query = statement.bind(&[wiki_image.wiki_id.into(),
                                                          wiki_image.url.clone().into(),
                                                          wiki_image.version.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn delete_wiki_image(&self, wiki_image: &WikiImages) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from wiki_images where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[wiki_image.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        if let Some(latest) = fetch_version_result {
            if wiki_image.version == latest.version {
                let statement = self.db.prepare("delete from wiki_images where id = ?1");
                let query = statement.bind(&[wiki_image.id.into()])?;
                query.run().await?;
                Ok(())
            } else {
                Err(worker::Error::RustError("Attempt to delete a stale object".to_string()))
            }
        } else {
            Err(worker::Error::RustError("Version is found None".to_string()))
        }
    }
}