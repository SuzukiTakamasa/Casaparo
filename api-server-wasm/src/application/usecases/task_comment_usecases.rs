use crate::domain::entities::task::TaskComments;
use crate::domain::repositories::task_comment_repository::TaskCommentRepository;
use worker::Result;


pub struct TaskCommentUsecases<R: TaskCommentRepository> {
    repository: R,
}

impl<R: TaskCommentRepository> TaskCommentUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_task_comments(&self) -> Result<Vec<TaskComments>> {
        self.repository.get_task_comments().await
    }

    pub async fn create_task_comment(&self, label: &TaskComments) -> Result<()> {
        self.repository.create_task_comment(label).await
    }

    pub async fn update_task_comment(&self, label: &mut TaskComments) -> Result<()> {
        self.repository.update_task_comment(label).await
    }

    pub async fn delete_task_comment(&self, label: &mut TaskComments) -> Result<()> {
        self.repository.delete_task_comment(label).await
    }
}