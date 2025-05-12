use crate::domain::entities::inventory::{ShoppingNotes, ExtractedShoppingNotes, RegisteringInventoriesList};
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::shopping_note_repository::ShoppingNoteRepository;
use crate::{optimistic_lock, worker_error};
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
        let query = self.db.prepare(r#"select s.id,
                                                            cast(json_extract(value, '$.id') as integer) as note_id,
                                                            cast(json_extract(value, '$.types') as integer) as note_types,
                                                            json_extract(value, '$.name') as note_name,
                                                            cast(json_extract(value, '$.amount') as integer ) as note_amount,
                                                            cast(json_extract(value, '$.created_by') as integer) as note_created_by,
                                                            cast(json_extract(value, '$.version') as integer) as note_version,
                                                            s.is_registered,
                                                            s.created_by,
                                                            s.version
                                                            from shopping_notes s,
                                                            json_each(s.notes) as notes
                                                            order by s.is_registered asc, s.id desc"#);
        let result = query.all().await?;
        result.results::<ExtractedShoppingNotes>()
    }

    async fn create_shopping_note(&self, shopping_note: &ShoppingNotes) -> Result<()> {
        let statement = self.db.prepare(r#"insert into shopping_notes
                                                                (notes, is_registered, created_by, version)
                                                                values (?1, ?2, ?3, ?4)"#);
        let query = statement.bind(&[shopping_note.notes.clone().into(),
                                                          shopping_note.is_registered.into(),
                                                          shopping_note.created_by.into(),
                                                          shopping_note.version.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn register_shopping_note_to_inventory(&self, shopping_note: &mut ShoppingNotes) -> Result<()> {
        let statement = self.db.prepare(r#"select
                                                                cast(json_extract(value, '$.id') as integer) as note_id,
                                                                cast(json_extract(value, '$.types') as integer) as note_types,
                                                                json_extract(value, '$.name') as note_name,
                                                                cast(json_extract(value, '$.amount') as integer ) as note_amount,
                                                                cast(json_extract(value, '$.created_by') as integer) as note_created_by,
                                                                cast(json_extract(value, '$.version') as integer) as note_version
                                                                from shopping_notes s,
                                                                json_each(s.notes) as notes
                                                                where s.id = ?1"#);
        let query = statement.bind(&[shopping_note.id.into()])?;
        let result = query.all().await?;
        let mut register_inventories_list = match result.results::<RegisteringInventoriesList>() {
            Ok(r) => r,
            Err(_) => return worker_error!("Failed to fetch shopping notes detail")
        };

        let mut query_lists = Vec::new();
        for r in register_inventories_list.iter_mut() {
            if r.note_id == 0 {
                let insert_inventories_statement = self.db.prepare(r#"insert into inventories
                                                                                         (types, name, amount, created_by, version)
                                                                                         values (?1, ?2, ?3, ?4, ?5)"#);
                let insert_inventories_query = insert_inventories_statement.bind(&[r.note_types.into(),
                                                                                                        r.note_name.clone().into(),
                                                                                                        r.note_amount.into(),
                                                                                                        r.note_created_by.into(),
                                                                                                        r.note_version.into()])?;
                query_lists.push(insert_inventories_query);                                                                                    
            } else {
                let fetch_version_statement = self.db.prepare(r#"select version
                                                                                    from inventories
                                                                                    where id = ?1"#);
                let fetch_version_query = fetch_version_statement.bind(&[r.note_id.into()])?;
                let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
                if let Some(latest) = fetch_version_result {
                    if r.note_version == latest.version {
                        r.note_version += 1;
                    } else {
                        return worker_error!("Attempt to update a stale object")
                    }
                } else {
                    return worker_error!("Version is found None")
                }
                let update_inventories_statement = self.db.prepare(r#"update inventories
                                                                                         set amount = amount + ?1,
                                                                                         version = ?2
                                                                                         where id = ?3"#);
                let update_inventories_query = update_inventories_statement.bind(&[r.note_amount.into(),
                                                                                                        r.note_version.into(),
                                                                                                        r.note_id.into()])?;
                query_lists.push(update_inventories_query);
            }
        }
        let fetch_version_statement = self.db.prepare(r#"select version
                                                                              from shopping_notes
                                                                              where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[shopping_note.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, shopping_note);

        let update_is_registered_statement = self.db.prepare(r#"update shopping_notes
                                                                                     set is_registered = 1,
                                                                                     version = ?1
                                                                                     where id = ?2"#);
        let update_is_registered_query = update_is_registered_statement.bind(&[shopping_note.version.into(),
                                                                                                    shopping_note.id.into()])?;
        query_lists.push(update_is_registered_query);
        
        self.db.batch(query_lists).await?;
        Ok(())
    }

    async fn register_to_inventory(&self, shopping_note: &mut ShoppingNotes) -> Result<()> {

        let fetch_version_statement = self.db.prepare(r#"select version
                                                                              from shopping_notes
                                                                              where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[shopping_note.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, shopping_note);

        let update_is_registered_statement = self.db.prepare(r#"update shopping_notes
                                                                                     set is_registered = 1,
                                                                                     version = ?1
                                                                                     where id = ?2"#);
        let update_is_registered_query = update_is_registered_statement.bind(&[shopping_note.version.into(),
                                                                                                    shopping_note.id.into()])?;
        update_is_registered_query.run().await?;
        Ok(())
    }

    async fn update_shopping_note(&self, shopping_note: &mut ShoppingNotes) -> Result<()> {
        let fetch_version_statement = self.db.prepare(r#"select version
                                                                              from shopping_notes
                                                                              where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[shopping_note.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, shopping_note);

        let statement = self.db.prepare(r#"update shopping_notes
                                                                set notes = ?1,
                                                                is_registered = ?2,
                                                                version = ?3
                                                                where id = ?4"#);
        let query = statement.bind(&[shopping_note.notes.clone().into(),
                                                          shopping_note.is_registered.into(),
                                                          shopping_note.version.into(),
                                                          shopping_note.id.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn delete_shopping_note(&self, shopping_note: &mut ShoppingNotes) -> Result<()> {
        let fetch_version_statement = self.db.prepare(r#"select version
                                                                              from shopping_notes
                                                                              where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[shopping_note.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, shopping_note);
        
        let statement = self.db.prepare(r#"delete
                                                                from shopping_notes
                                                                where id = ?1"#);
        let query = statement.bind(&[shopping_note.id.into()])?;
        query.run().await?;
        Ok(())
    }
}