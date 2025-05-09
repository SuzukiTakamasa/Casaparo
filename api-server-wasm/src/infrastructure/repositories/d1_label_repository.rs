use crate::domain::entities::setting::{Labels, CountOfUsedLabel};
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::label_repository::LabelRepository;
use crate::{optimistic_lock, worker_error};
use crate::async_trait::async_trait;
use worker::{D1Database, Result};
use std::sync::Arc;

pub struct D1LabelRepository {
    db: Arc<D1Database>,
}

impl D1LabelRepository {
    pub fn new(db: Arc<D1Database>) -> Self {
        Self { db }
    }
}

#[async_trait(?Send)]
impl LabelRepository for D1LabelRepository {
    async fn get_labels(&self) -> Result<Vec<Labels>> {
        let query = self.db.prepare(r#"select *
                                                            from labels
                                                            order by id desc"#);
        let result = query.all().await?;
        result.results::<Labels>()
    }

    async fn get_the_count_of_used_label(&self, id: u32) -> Result<CountOfUsedLabel> {
        let statement = self.db.prepare(r#"select count(*) as count_of_used_label
                                                                from schedules
                                                                where label_id = ?1"#);
        let query = statement.bind(&[id.into()])?;
        let result = query.first::<CountOfUsedLabel>(None).await?;
        match result {
            Some(count_of_used_label) => Ok(count_of_used_label),
            None => worker_error!("Failed to get the count of used label")
        }
    }

    async fn create_label(&self, label: &Labels) -> Result<()> {
        let statement = self.db.prepare(r#"insert into labels
                                                                (name, label, version)
                                                                values (?1, ?2, ?3)"#);
        let query = statement.bind(&[label.name.clone().into(),
                                                          label.label.clone().into(),
                                                          label.version.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn update_label(&self, label: &mut Labels) -> Result<()> {
        let fetch_version_statement = self.db.prepare(r#"select version
                                                                              from labels
                                                                              where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[label.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, label);
        let statement = self.db.prepare(r#"update labels
                                                                set name = ?1,
                                                                label = ?2,
                                                                version = ?3
                                                                where id = ?4"#);
        let query = statement.bind(&[label.name.clone().into(),
                                                          label.label.clone().into(),
                                                          label.version.into(),
                                                          label.id.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn delete_label(&self, label: &mut Labels) -> Result<()> {
        let fetch_version_statement = self.db.prepare(r#"select version
                                                                              from labels
                                                                              where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[label.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, label);
        let statement = self.db.prepare(r#"delete
                                                                from labels
                                                                where id = ?1"#);
        let query = statement.bind(&[label.id.into()])?;
        query.run().await?;
        Ok(())
    }
}