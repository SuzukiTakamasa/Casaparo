use crate::domain::entities::setting::{InventoryTypes, CountOfUsedInventoryType};
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::inventory_type_repository::InventoryTypeRepository;
use crate::{optimistic_lock, worker_error};
use crate::async_trait::async_trait;
use worker::{D1Database, Result};
use std::sync::Arc;

pub struct D1InventoryTypeRepository {
    db: Arc<D1Database>,
}

impl D1InventoryTypeRepository {
    pub fn new(db: Arc<D1Database>) -> Self {
        Self { db }
    }
}

#[async_trait(?Send)]
impl InventoryTypeRepository for D1InventoryTypeRepository {
    async fn get_inventory_types(&self) -> Result<Vec<InventoryTypes>> {
        let query = self.db.prepare(r#"select *
                                                            from inventory_types
                                                            order by id desc"#);
        let result = query.all().await?;
        result.results::<InventoryTypes>()
    }

    async fn get_the_count_of_used_inventory_type(&self, id: u32) -> Result<CountOfUsedInventoryType> {
        let statement = self.db.prepare(r#"select count(*) as count_of_used_inventory_types
                                                                from inventories
                                                                where types = ?1"#);
        let query = statement.bind(&[id.into()])?;
        let result = query.first::<CountOfUsedInventoryType>(None).await?;
        match result {
            Some(count_of_used_inventory_types) => Ok(count_of_used_inventory_types),
            None => worker_error!("Failed to get the count of used inventory_types")
        }
    }

    async fn create_inventory_type(&self, inventory_type: &InventoryTypes) -> Result<()> {
        let statement = self.db.prepare(r#"insert into inventory_types
                                                                (types, version)
                                                                values (?1, ?2)"#);
        let query = statement.bind(&[inventory_type.types.clone().into(),
                                                          inventory_type.version.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn update_inventory_type(&self, inventory_type: &mut InventoryTypes) -> Result<()> {
        let fetch_version_statement = self.db.prepare(r#"select version
                                                                              from inventory_types
                                                                              where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[inventory_type.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, inventory_type);

        let statement = self.db.prepare(r#"update inventory_types
                                                                set types = ?1,
                                                                version = ?2
                                                                where id = ?3"#);
        let query = statement.bind(&[inventory_type.types.clone().into(),
                                                          inventory_type.version.into(),
                                                          inventory_type.id.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn delete_inventory_type(&self, inventory_type: &mut InventoryTypes) -> Result<()> {
        let fetch_version_statement = self.db.prepare(r#"select version
                                                                              from inventory_types
                                                                              where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[inventory_type.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, inventory_type);
        
        let statement = self.db.prepare(r#"delete
                                                                from inventory_types
                                                                where id = ?1"#);
        let query = statement.bind(&[inventory_type.id.into()])?;
        query.run().await?;
        Ok(())
    }
}