use crate::domain::entities::inventory::Inventories;
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::inventory_repository::InventoryRepository;
use crate::async_trait::async_trait;
use worker::{D1Database, Result};
use std::sync::Arc;

pub struct D1InventoryRepository {
    db: Arc<D1Database>,
}

impl D1InventoryRepository {
    pub fn new(db: Arc<D1Database>) -> Self {
        Self { db }
    }
}

#[async_trait(?Send)]
impl InventoryRepository for D1InventoryRepository {
    async fn get_inventories(&self) -> Result<Vec<Inventories>> {
        let query = self.db.prepare("select * from inventories order by amount asc, id desc");
        let result = query.all().await?;
        result.results::<Inventories>()
    }

    async fn get_inventories_by_types(&self, types: u8) -> Result<Vec<Inventories>> {
        let statement = self.db.prepare("select * from inventories where types = ?1 order by amount asc, id desc");
        let query = statement.bind(&[types.into()])?;
        let result = query.all().await?;
        result.results::<Inventories>()
    }

    async fn create_inventory(&self, inventory: &Inventories) -> Result<()> {
        let statement = self.db.prepare("insert into inventories (types, name, amount, created_by, version) values (?1, ?2, ?3, ?4, ?5)");
        let query = statement.bind(&[inventory.types.into(),
                                                          inventory.name.clone().into(),
                                                          inventory.amount.into(),
                                                          inventory.created_by.into(),
                                                          inventory.version.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn update_amount(&self, inventory: &mut Inventories) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from inventories where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[inventory.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        if let Some(latest) = fetch_version_result {
            if inventory.version == latest.version {
                inventory.version += 1;
            } else {
                return Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
            }
        } else {
            return Err(worker::Error::RustError("Version is found None".to_string()))
        }
        let statement = self.db.prepare("update inventories set amount = amount + ?1, version = ?2 where id = ?3");
        let query = statement.bind(&[inventory.amount.into(),
                                                          inventory.version.into(),
                                                          inventory.id.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn update_inventory(&self, inventory: &mut Inventories) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from inventories where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[inventory.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        if let Some(latest) = fetch_version_result {
            if inventory.version == latest.version {
                inventory.version += 1;
            } else {
                return Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
            }
        } else {
            return Err(worker::Error::RustError("Version is found None".to_string()))
        }
        let statement = self.db.prepare("update inventories set types = ?1, name = ?2, amount = ?3, created_by = ?4, version = ?5 where id = ?6");
        let query = statement.bind(&[inventory.types.into(),
                                                          inventory.name.clone().into(),
                                                          inventory.amount.into(),
                                                          inventory.created_by.into(),
                                                          inventory.version.into(),
                                                          inventory.id.into()])?;
        query.run().await?;
        Ok(())                             
    }

    async fn delete_inventory(&self, inventory: &mut Inventories) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from inventories where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[inventory.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        if let Some(latest) = fetch_version_result {
            if inventory.version == latest.version {
                inventory.version += 1;
            } else {
                return Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
            }
        } else {
            return Err(worker::Error::RustError("Version is found None".to_string()))
        }
        let statement = self.db.prepare("delete from inventories where id = ?1");
        let query = statement.bind(&[inventory.id.into()])?;
        query.run().await?;
        Ok(())
    }
}