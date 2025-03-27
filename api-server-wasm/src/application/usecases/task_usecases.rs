use crate::domain::entities::task::Tasks;
use crate::domain::repositories::task_repository::TaskRepository;
use crate::worker_err;
use worker::Result;


pub struct TaskUsecases<R: TaskRepository> {
    repository: R,
}

impl Tasks {
    fn validate(&self) -> Result<()> {
        if self.title.len() == 0 {
            return Err(worker_err!("The title must not be empty."));
        }
        if self.status > 2 {
            return Err(worker_err!("The status must be 0, 1, or 2."));
        }
        if self.priority > 2 {
            return Err(worker_err!("The priority must be 0, 1, or 2."));
        }
        if self.description.len() == 0 {
            return Err(worker_err!("The description must not be empty."));
        }
        if self.created_by != 0 || self.created_by != 1 {
            return Err(worker_err!("The created_by must be 0 or 1."));
        }
        if self.updated_at.len() == 0 {
            return Err(worker_err!("The updated_at must not be empty."));
        }
        if self.due_date.len() == 0 {
            return Err(worker_err!("The due_date must not be empty."));
        }
        Ok(())
    }
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
        task.validate()?;
        self.repository.create_task(task).await
    }

    pub async fn update_task(&self, task: &mut Tasks) -> Result<()> {
        task.validate()?;
        self.repository.update_task(task).await
    }

    pub async fn delete_task(&self, task: &mut Tasks) -> Result<()> {
        task.validate()?;
        self.repository.delete_task(task).await
    }
}