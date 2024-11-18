use crate::domain::entities::task::TaskComments;
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::task_comment_repository::TaskCommentRepository;
use crate::async_trait::async_trait;
use worker::{D1Database, Result};
use std::sync::Arc;

pub struct D1TaskCommentRepository {
    db :Arc<D1Database>
}

impl D1TaskCommentRepository {
    pub fn new(db: Arc<D1Database>) -> Self {
        Self { db }
    }
}

#[async_trait(?Send)]
impl TaskCommentRepository for D1TaskCommentRepository {
    async fn get_task_comments(&self) -> Result<Vec<TaskComments>> {
        let query = self.db.prepare("select * from tasks");
        let result = query.all().await?;
        result.results::<TaskComments>()
    }

    async fn create_task_comment(&self, task_comment: &TaskComments) -> Result<()> {
        let statement = self.db.prepare("insert into task_comments (created_by, updated_at, comment, task_id, version) values (?1, ?2, ?3, ?4, ?5)");
        let query = statement.bind(&[task_comment.created_by.into(),
                                     task_comment.updated_at.clone().into(),
                                     task_comment.comment.clone().into(),
                                     task_comment.task_id.into(),
                                     task_comment.version.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn update_task_comment(&self, task_comment: &mut TaskComments) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from task_comments where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[task_comment.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        if let Some(latest) = fetch_version_result {
            if task_comment.version == latest.version {
                task_comment.version += 1;
            } else {
                return Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
            }
        } else {
            return Err(worker::Error::RustError("Version is found None".to_string()))
        }
        let statement = self.db.prepare("update task_comments set created_by = ?1, updated_at = ?2, comment = ?3, task_id = ?4, version = ?5 where id = ?6");
        let query = statement.bind(&[task_comment.created_by.into(),
                                     task_comment.updated_at.clone().into(),
                                     task_comment.comment.clone().into(),
                                     task_comment.task_id.into(),
                                     task_comment.version.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn delete_task_comment(&self, task_comment: &mut TaskComments) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from task_comments where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[task_comment.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        if let Some(latest) = fetch_version_result {
            if task_comment.version == latest.version {
                task_comment.version += 1;
            } else {
                return Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
            }
        } else {
            return Err(worker::Error::RustError("Version is found None".to_string()))
        }
        let statement = self.db.prepare("delete from task_comments where id = ?1");
        let query = statement.bind(&[task_comment.id.into()])?;
        query.run().await?;
        Ok(())
    }
}