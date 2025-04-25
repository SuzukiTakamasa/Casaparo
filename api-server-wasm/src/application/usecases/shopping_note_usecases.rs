use crate::domain::entities::inventory::{ShoppingNotes, ExtractedShoppingNotes};
use crate::domain::repositories::shopping_note_repository::ShoppingNoteRepository;
use worker::Result;

pub struct ShoppingNoteUsecases<R: ShoppingNoteRepository> {
    repository: R
}

impl<R: ShoppingNoteRepository> ShoppingNoteUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_shopping_notes(&self) -> Result<Vec<ExtractedShoppingNotes>> {
        self.repository.get_shopping_notes().await
    }

    pub async fn create_shopping_note(&self, shopping_notes: &ShoppingNotes) -> Result<()> {
        self.repository.create_shopping_note(shopping_notes).await
    }

    pub async fn register_shopping_note_to_inventory(&self, shopping_note: &mut ShoppingNotes) -> Result<()> {
        self.repository.register_shopping_note_to_inventory(shopping_note).await
    }

    pub async fn register_to_inventory(&self, shopping_note: &mut ShoppingNotes) -> Result<()> {
        self.repository.register_to_inventory(shopping_note).await
    }

    pub async fn update_shopping_note(&self, shopping_note: &mut ShoppingNotes) -> Result<()> {
        self.repository.update_shopping_note(shopping_note).await
    }

    pub async fn delete_shopping_note(&self, shopping_note: &mut ShoppingNotes) -> Result<()> {
        self.repository.delete_shopping_note(shopping_note).await
    }

}