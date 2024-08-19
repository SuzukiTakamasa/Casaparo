use crate::domain::entities::setting::Labels;
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::label_repository::LabelRepository;
use crate::async_trait::async_trait;
use worker::{D1Database, Result};
use std::sync::Arc;

pub struct D1LabelRepository {
    db: Arc<D1Database>,
}

impl D1LabelRepository {
    pub fn new(db: Arc<D1Database>) -> Self {
        Self { db: db }
    }
}

#[async_trait(?Send)]
impl LabelRepository for D1LabelRepository {
    async fn get_labels(&self) -> Result<Vec<Labels>> {
        let query = self.db.prepare("select * from labels order by id desc");
        let result = query.all().await?;
        result.results::<Labels>()
    }

    async fn create_label(&self, label: &Labels) -> Result<()> {
        let statement = self.db.prepare("insert into labels (name, label, version) values (?1, ?2, ?3)");
        let query = statement.bind(&[label.name.clone().into(),
                                                          label.label.clone().into(),
                                                          label.version.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn update_label(&self, label: &mut Labels) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from labels where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[label.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        if let Some(latest) = fetch_version_result {
            if label.version == latest.version {
                label.version += 1;
            } else {
                return Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
            }
        } else {
            return Err(worker::Error::RustError("Version is found None".to_string()))
        }
        let statement = self.db.prepare("update labels set name = ?1, label = ?2, version = ?3, where id = ?4");
        let query = statement.bind(&[label.name.clone().into(),
                                                          label.label.clone().into(),
                                                          label.version.into(),
                                                          label.id.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn delete_label(&self, label: &mut Labels) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from labels where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[label.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        if let Some(latest) = fetch_version_result {
            if label.version == latest.version {
                label.version += 1;
            } else {
                return Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
            }
        } else {
            return Err(worker::Error::RustError("Version is found None".to_string()))
        }
        let statement = self.db.prepare("delete from labels where id = ?1");
        let query = statement.bind(&[label.id.into()])?;
        query.run().await?;
        Ok(())
    }
}