use crate::domain::entities::setting::{InventoryTypes, CountOfUsedInventoryType};
use crate::async_trait::async_trait;
use worker::Result;

#[async_trait(?Send)]
pub trait InventoryTypeRepository {
    async fn get_inventory_types(&self) -> Result<Vec<InventoryTypes>>;
    async fn get_the_count_of_used_inventory_type(&self, id: u32) -> Result<CountOfUsedInventoryType>;
    async fn create_inventory_type(&self, inventory_type: &InventoryTypes) -> Result<()>;
    async fn update_inventory_type(&self, inventory_type: &mut InventoryTypes) -> Result<()>;
    async fn delete_inventory_type(&self, inventory_type: &mut InventoryTypes) -> Result<()>;
}