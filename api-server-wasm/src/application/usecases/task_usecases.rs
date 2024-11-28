use crate::domain::entities::task::Tasks;
use crate::domain::repositories::task_repository::TaskRepository;
use worker::Result;


pub struct TaskUsecases<R: TaskRepository> {
    repository: R,
}

impl<R: TaskRepository> TaskUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_tasks(&self) -> Result<Vec<Tasks>> {
        self.repository.get_tasks().await
    }

    pub async fn get_related_sub_tasks(&self, id: u32) -> Result<Vec<Tasks>> {
        self.repository.get_related_sub_tasks(id).await
    }

    pub async fn get_task_by_id(&self, id: u32) -> Result<Tasks> {
        self.repository.get_task_by_id(id).await
    }

    pub async fn create_task(&self, task: &Tasks) -> Result<()> {
        self.repository.create_task(task).await
    }

    pub async fn update_task(&self, task: &mut Tasks) -> Result<()> {
        self.repository.update_task(task).await
    }

    pub async fn delete_task(&self, task: &mut Tasks) -> Result<()> {
        self.repository.delete_task(task).await
    }
}