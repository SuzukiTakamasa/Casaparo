use crate::domain::entities::task::TaskComments;
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::task_comment_repository::TaskCommentRepository;
use crate::{optimistic_lock, worker_error};
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
    async fn get_task_comments_by_task_id(&self, task_id: u32) -> Result<Vec<TaskComments>> {
        let statement = self.db.prepare(r#"select *
                                                                from task_comments
                                                                where task_id = ?1"#);
        let query = statement.bind(&[task_id.into()])?; 
        let result = query.all().await?;
        result.results::<TaskComments>()
    }

    async fn create_task_comment(&self, task_comment: &TaskComments) -> Result<()> {
        let statement = self.db.prepare(r#"insert into task_comments
                                                                (created_by, updated_at, comment, task_id, version)
                                                                values (?1, ?2, ?3, ?4, ?5)"#);
        let query = statement.bind(&[task_comment.created_by.into(),
                                                          task_comment.updated_at.clone().into(),
                                                          task_comment.comment.clone().into(),
                                                          task_comment.task_id.into(),
                                                          task_comment.version.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn update_task_comment(&self, task_comment: &mut TaskComments) -> Result<()> {
        let fetch_version_statement = self.db.prepare(r#"select version
                                                                              from task_comments
                                                                              where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[task_comment.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, task_comment);
        
        let statement = self.db.prepare(r#"update task_comments
                                                                set created_by = ?1,
                                                                updated_at = ?2,
                                                                comment = ?3,
                                                                task_id = ?4,
                                                                version = ?5
                                                                where id = ?6"#);
        let query = statement.bind(&[task_comment.created_by.into(),
                                                          task_comment.updated_at.clone().into(),
                                                          task_comment.comment.clone().into(),
                                                          task_comment.task_id.into(),
                                                          task_comment.version.into(),
                                                          task_comment.id.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn delete_task_comment(&self, task_comment: &mut TaskComments) -> Result<()> {
        let fetch_version_statement = self.db.prepare(r#"select version
                                                                              from task_comments
                                                                              where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[task_comment.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, task_comment);

        let statement = self.db.prepare(r#"delete
                                                                from task_comments
                                                                where id = ?1"#);
        let query = statement.bind(&[task_comment.id.into()])?;
        query.run().await?;
        Ok(())
    }
}