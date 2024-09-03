use crate::domain::entities::inventory::{Inventories, ShoppingNotes};
use crate::async_trait::async_trait;
use worker::Result;

#[async_trait(?Send)]
pub trait ShoppingNoteRepository {
    async fn get_shopping_notes(&self) -> Result<Vec<ShoppingNotes>>;
    async fn create_shopping_note(&self, shopping_note: &ShoppingNotes) -> Result<()>;
    async fn register_to_inventory(&self, shopping_note: &mut ShoppingNotes, inventory: &mut Inventories) -> Result<()>;
    async fn update_shopping_notes(&self, shopping_notes: &mut ShoppingNotes) -> Result<()>;
    async fn delete_shopping_notes(&self, shopping_notes: &mut ShoppingNotes) -> Result<()>;
}