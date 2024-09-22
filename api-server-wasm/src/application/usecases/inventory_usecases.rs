use crate::domain::entities::inventory::Inventories;
use crate::domain::repositories::inventory_repository::InventoryRepository;
use worker::Result;


pub struct InventoryUsecases<R: InventoryRepository> {
    repository: R,
}

impl<R: InventoryRepository> InventoryUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_inventories(&self) -> Result<Vec<Inventories>> {
        self.repository.get_inventories().await
    }

    pub async fn get_inventories_by_types(&self, types: u8) -> Result<Vec<Inventories>> {
        self.repository.get_inventories_by_types(types).await
    }

    pub async fn create_inventory(&self, inventory: &Inventories) -> Result<()> {
        self.repository.create_inventory(inventory).await
    }

    pub async fn update_amount(&self, inventory: &mut Inventories) -> Result<()> {
        self.repository.update_amount(inventory).await
    }

    pub async fn update_inventory(&self, inventory: &mut Inventories) -> Result<()> {
        self.repository.update_inventory(inventory).await
    }

    pub async fn delete_inventory(&self, inventory: &mut Inventories) -> Result<()> {
        self.repository.delete_inventory(inventory).await
    }
}