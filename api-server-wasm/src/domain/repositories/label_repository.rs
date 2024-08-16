use crate::domain::entities::setting::Labels;
use crate::async_trait::async_trait;
use worker::Result;

#[async_trait(?Send)]
pub trait LabelRepository {
    async fn get_labels(&self) -> Result<Vec<Labels>>;
    async fn create_label(&self, label: &Labels) -> Result<()>;
    async fn update_label(&self, label: &mut Labels) -> Result<()>;
    async fn delete_label(&self, label: &mut Labels) -> Result<()>;
}