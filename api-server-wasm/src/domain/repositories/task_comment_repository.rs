use crate::domain::entities::task::TaskComments;
use crate::async_trait::async_trait;
use worker::Result;

#[async_trait(?Send)]
pub trait TaskCommentRepository {
    async fn get_task_comments(&self) -> Result<Vec<TaskComments>>;
    async fn create_task_comment(&self, task_comment: &TaskComments) -> Result<()>;
    async fn update_task_comment(&self, task_comment: &mut TaskComments) -> Result<()>;
    async fn delete_task_comment(&self, task_comment: &mut TaskComments) -> Result<()>;
}