use crate::domain::entities::task::Tasks;
use crate::async_trait::async_trait;
use worker::Result;

#[async_trait(?Send)]
pub trait TaskRepository {
    async fn get_tasks(&self) -> Result<Vec<Tasks>>;
    async fn get_related_sub_tasks(&self, id: u32) -> Result<Vec<Tasks>>;
    async fn get_task_by_id(&self, id: u32) -> Result<Tasks>;
    async fn create_task(&self, task: &Tasks) -> Result<()>;
    async fn update_task(&self, task: &mut Tasks) -> Result<()>;
    async fn delete_task(&self, task: &mut Tasks) -> Result<()>;
}