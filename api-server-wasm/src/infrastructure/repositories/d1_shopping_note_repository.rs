use crate::domain::entities::inventory::{ShoppingNotes, ExtractedShoppingNotes};
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::shopping_note_repository::ShoppingNoteRepository;
use crate::async_trait::async_trait;
use worker::{D1Database, Result};
use std::sync::Arc;

pub struct D1ShoppingNoteRepository {
    db: Arc<D1Database>,
}

impl D1ShoppingNoteRepository {
    pub fn new(db: Arc<D1Database>) -> Self {
        Self { db }
    }
}

#[async_trait(?Send)]
impl ShoppingNoteRepository for D1ShoppingNoteRepository {
    async fn get_shopping_notes(&self) -> Result<Vec<ExtractedShoppingNotes>> {
        let query = self.db.prepare("select s.id, cast(json_extract(value, '$.id') as integer) as note_id, cast(json_extract(value, '$.types') as integer) as note_types, json_extract(value, '$.name') as note_name, cast(json_extract(value, '$.amount') as integer ) as note_amount, cast(json_extract(value, '$.created_by') as integer) as note_created_by, cast(json_extract(value, '$.version') as integer) as note_version, s.is_registered, s.created_by, s.version from shopping_notes s, json_each(s.notes) as notes order by s.is_registered asc, s.id desc");
        let result = query.all().await?;
        result.results::<ExtractedShoppingNotes>()
    }

    async fn create_shopping_note(&self, shopping_note: &ShoppingNotes) -> Result<()> {
        let statement = self.db.prepare("insert into shopping_notes (notes, is_registered, created_by, version) values (?1, ?2, ?3, ?4)");
        let query = statement.bind(&[shopping_note.notes.clone().into(),
                                                          shopping_note.is_registered.into(),
                                                          shopping_note.created_by.into(),
                                                          shopping_note.version.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn register_to_inventory(&self, shopping_note: &ShoppingNotes) -> Result<()> {
        let statement = self.db.prepare("select cast(json_extract(value, '$.id') as integer) as note_id, cast(json_extract(value, '$.types') as integer) as note_types, json_extract(value, '$.name') as note_name, cast(json_extract(value, '$.amount') as integer ) as note_amount, cast(json_extract(value, '$.created_by') as integer) as note_created_by, cast(json_extract(value, '$.version') as integer) as note_version from shopping_notes s, json_each(s.notes) as notes where s.id = ?1");
        let query = statement.bind(&[shopping_note.id.into()])?;
        let result = query.all().await?;
        let registering_inventories_list = match result.results::<ExtractedShoppingNotes>() {
            Ok(r) => r,
            Err(_) => return Err(worker::Error::RustError("Failed to fetch shopping notes detail".to_string()))
        };

        let mut insert_query_list = Vec::new();
        let mut update_query_list = Vec::new();

        for r in registering_inventories_list.iter() {
            if r.note_id == 0 {
                insert_query_list.push(self.db.prepare(format!("insert into inventories (types, name, amount, created_by, version) values ( {}, {}, {}, {}, 1)", r.note_types, r.note_name, r.note_amount, r.note_created_by)))
            } else {
                update_query_list.push(self.db.prepare(format!("update inventories set amount = amount + {} where id = {}", r.note_amount, r.note_id)))
            }
        }

        let mut query_list = Vec::new();
        query_list.push(self.db.prepare("begin;"));
        query_list.append(&mut insert_query_list);
        query_list.append(&mut update_query_list);
        query_list.push(self.db.prepare(format!("update shopping_notes set is_registered = 1 where id = {:?}", shopping_note.id)));
        query_list.push(self.db.prepare("commit;"));

        let batch_result = self.db.batch(query_list).await;

        match batch_result {
            Ok(_) => Ok(()),
            Err(_) => {
                let _ = self.db.exec("rollback;").await;
                return Err(worker::Error::RustError("Transaction rollbacked".to_string()))
            }
        }
    }

    async fn update_shopping_note(&self, shopping_note: &mut ShoppingNotes) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from shopping_notes where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[shopping_note.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        if let Some(latest) = fetch_version_result {
            if shopping_note.version == latest.version {
                shopping_note.version += 1;
            } else {
                return Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
            }
        } else {
            return Err(worker::Error::RustError("Version is found None".to_string()))
        }
        let statement = self.db.prepare("update shopping_notes set notes = ?1, is_registered = ?2, version = ?3 where id = ?4");
        let query = statement.bind(&[shopping_note.notes.clone().into(),
                                                          shopping_note.is_registered.into(),
                                                          shopping_note.version.into(),
                                                          shopping_note.id.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn delete_shopping_note(&self, shopping_note: &mut ShoppingNotes) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from shopping_notes where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[shopping_note.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        if let Some(latest) = fetch_version_result {
            if shopping_note.version == latest.version {
                shopping_note.version += 1;
            } else {
                return Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
            }
        } else {
            return Err(worker::Error::RustError("Version is found None".to_string()))
        }
        let statement = self.db.prepare("delete from shopping_notes where id = ?1");
        let query = statement.bind(&[shopping_note.id.into()])?;
        query.run().await?;
        Ok(())
    }
}