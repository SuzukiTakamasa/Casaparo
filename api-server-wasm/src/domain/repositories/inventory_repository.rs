use crate::domain::entities::inventory::{Inventories, AddedAmount};
use crate::async_trait::async_trait;
use worker::Result;

#[async_trait(?Send)]
pub trait InventoryRepository {
    async fn get_inventories(&self) -> Result<Vec<Inventories>>;
    async fn create_inventory(&self, inventory: Inventories) -> Result<()>;
    async fn update_inventory(&self, inventory: &mut Inventories) -> Result<()>;
    async fn add_amount(&self, inventory: &mut AddedAmount) -> Result<()>;
    async fn delete_inventory(&self, inventory: &mut Inventories) -> Result<()>;
}