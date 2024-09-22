use crate::domain::entities::inventory::Inventories;
use crate::async_trait::async_trait;
use worker::Result;

#[async_trait(?Send)]
pub trait InventoryRepository {
    async fn get_inventories(&self) -> Result<Vec<Inventories>>;
    async fn get_inventories_by_types(&self, types: u8) -> Result<Vec<Inventories>>;
    async fn create_inventory(&self, inventory: &Inventories) -> Result<()>;
    async fn update_amount(&self, inventory: &mut Inventories) -> Result<()>;
    async fn update_inventory(&self, inventory: &mut Inventories) -> Result<()>;
    async fn delete_inventory(&self, inventory: &mut Inventories) -> Result<()>;
}