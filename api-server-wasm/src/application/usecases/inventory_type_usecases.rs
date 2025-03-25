use crate::domain::entities::setting::{InventoryTypes, IsUsed};
use crate::domain::repositories::inventory_type_repository::InventoryTypeRepository;
use worker::Result;


pub struct InventoryTypeUsecases<R: InventoryTypeRepository> {
    repository: R,
}

impl InventoryTypes {
    fn validate(&self) -> Result<()> {
        if self.types.len() == 0 {
            return Err(worker::Error::RustError("The types must not be empty.".to_string()));
        }
        Ok(())
    }
}

impl<R: InventoryTypeRepository> InventoryTypeUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_inventory_types(&self) -> Result<Vec<InventoryTypes>> {
        self.repository.get_inventory_types().await
    }

    pub async fn is_used_for_inventory(&self, id: u32) -> Result<IsUsed> {
        let result = self.repository.get_the_count_of_used_inventory_type(id).await?;
        Ok(IsUsed { is_used: result.count_of_used_inventory_type > 0})
    }

    pub async fn create_inventory_type(&self, inventory_type: &InventoryTypes) -> Result<()> {
        inventory_type.validate()?;
        self.repository.create_inventory_type(inventory_type).await
    }

    pub async fn update_inventory_type(&self, inventory_type: &mut InventoryTypes) -> Result<()> {
        inventory_type.validate()?;
        self.repository.update_inventory_type(inventory_type).await
    }

    pub async fn delete_inventory_type(&self, inventory_type: &mut InventoryTypes) -> Result<()> {
        inventory_type.validate()?;
        self.repository.delete_inventory_type(inventory_type).await
    }
}