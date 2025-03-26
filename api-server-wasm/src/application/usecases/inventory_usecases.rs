use crate::domain::entities::inventory::Inventories;
use crate::domain::repositories::inventory_repository::InventoryRepository;
use crate::worker_err;
use worker::Result;


pub struct InventoryUsecases<R: InventoryRepository> {
    repository: R,
}

impl Inventories {
    fn validate(&self) -> Result<()> {
        if self.name.len() == 0 {
            return Err(worker_err!("The name must not be empty."));
        }
        if self.created_by == 0 || self.created_by == 1 {
            return Err(worker_err!("The created_by must be 0 or 1."));
        }
        Ok(())
    }
}

impl<R: InventoryRepository> InventoryUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_inventories(&self) -> Result<Vec<Inventories>> {
        self.repository.get_inventories().await
    }

    pub async fn create_inventory(&self, inventory: &Inventories) -> Result<()> {
        inventory.validate()?;
        self.repository.create_inventory(inventory).await
    }

    pub async fn update_amount(&self, inventory: &mut Inventories) -> Result<()> {
        inventory.validate()?;
        self.repository.update_amount(inventory).await
    }

    pub async fn update_inventory(&self, inventory: &mut Inventories) -> Result<()> {
        inventory.validate()?;
        self.repository.update_inventory(inventory).await
    }

    pub async fn delete_inventory(&self, inventory: &mut Inventories) -> Result<()> {
        inventory.validate()?;
        self.repository.delete_inventory(inventory).await
    }
}