use crate::domain::entities::inventory::{ShoppingNotes, ExtractedShoppingNotes};
use crate::domain::repositories::shopping_note_repository::ShoppingNoteRepository;
use crate::worker_err;
use worker::Result;

pub struct ShoppingNoteUsecases<R: ShoppingNoteRepository> {
    repository: R
}

impl ShoppingNotes {
    fn validate(&self) -> Result<()> {
        if self.notes.len() == 0 {
            return Err(worker_err!("The notes must not be empty."));
        }
        if self.is_registered != 0 || self.is_registered != 1 {
            return Err(worker_err!("The is_registered must be 0 or 1."));
        }
        if self.created_by != 0 || self.created_by != 1 {
            return Err(worker_err!("The created_by must be 0 or 1."));
        }
        Ok(())
    }
}

impl<R: ShoppingNoteRepository> ShoppingNoteUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_shopping_notes(&self) -> Result<Vec<ExtractedShoppingNotes>> {
        self.repository.get_shopping_notes().await
    }

    pub async fn create_shopping_note(&self, shopping_note: &ShoppingNotes) -> Result<()> {
        shopping_note.validate()?;
        self.repository.create_shopping_note(shopping_note).await
    }

    pub async fn register_to_inventory(&self, shopping_note: &mut ShoppingNotes) -> Result<()> {
        shopping_note.validate()?;
        self.repository.register_to_inventory(shopping_note).await
    }

    pub async fn update_shopping_note(&self, shopping_note: &mut ShoppingNotes) -> Result<()> {
        shopping_note.validate()?;
        self.repository.update_shopping_note(shopping_note).await
    }

    pub async fn delete_shopping_note(&self, shopping_note: &mut ShoppingNotes) -> Result<()> {
        shopping_note.validate()?;
        self.repository.delete_shopping_note(shopping_note).await
    }

}