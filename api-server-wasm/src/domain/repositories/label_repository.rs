use crate::domain::entities::setting::{Labels, CountOfUsedLabel};
use crate::async_trait::async_trait;
use worker::Result;

#[async_trait(?Send)]
pub trait LabelRepository {
    async fn get_labels(&self) -> Result<Vec<Labels>>;
    async fn get_the_count_of_used_label(&self, id: u32) -> Result<CountOfUsedLabel>;
    async fn create_label(&self, label: &Labels) -> Result<()>;
    async fn update_label(&self, label: &mut Labels) -> Result<()>;
    async fn delete_label(&self, label: &mut Labels) -> Result<()>;
}