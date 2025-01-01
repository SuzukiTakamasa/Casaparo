use crate::domain::entities::task::{TaskComments, HasTaskComments};
use crate::domain::repositories::task_comment_repository::TaskCommentRepository;
use worker::Result;


pub struct TaskCommentUsecases<R: TaskCommentRepository> {
    repository: R,
}

impl<R: TaskCommentRepository> TaskCommentUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_task_comments_by_task_id(&self, task_id: u32) -> Result<Vec<TaskComments>> {
        self.repository.get_task_comments_by_task_id(task_id).await
    }

    pub async fn has_comments(&self, id: u32) -> Result<HasTaskComments> {
        match self.repository.get_task_comments_by_task_id(id).await {
            Ok(comments) => {
                Ok(HasTaskComments { has_comments: !comments.is_empty() })
            }
            Err(_) => {
                Ok(HasTaskComments { has_comments: false })
            }
        }
    }

    pub async fn create_task_comment(&self, task_comment: &TaskComments) -> Result<()> {
        self.repository.create_task_comment(task_comment).await
    }

    pub async fn update_task_comment(&self, task_comment: &mut TaskComments) -> Result<()> {
        self.repository.update_task_comment(task_comment).await
    }

    pub async fn delete_task_comment(&self, task_comment: &mut TaskComments) -> Result<()> {
        self.repository.delete_task_comment(task_comment).await
    }
}