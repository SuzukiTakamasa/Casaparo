use crate::domain::entities::inventory::{ShoppingNotes, ExtractedShoppingNotes};
use crate::async_trait::async_trait;
use worker::Result;

#[async_trait(?Send)]
pub trait ShoppingNoteRepository {
    async fn get_shopping_notes(&self) -> Result<Vec<ExtractedShoppingNotes>>;
    async fn create_shopping_note(&self, shopping_note: &ShoppingNotes) -> Result<()>;
    async fn register_shopping_note_to_inventory(&self, shopping_note: &mut ShoppingNotes) -> Result<()>;
    async fn register_to_inventory(&self, shopping_note: &mut ShoppingNotes) -> Result<()>;
    async fn update_shopping_note(&self, shopping_note: &mut ShoppingNotes) -> Result<()>;
    async fn delete_shopping_note(&self, shopping_note: &mut ShoppingNotes) -> Result<()>;
}