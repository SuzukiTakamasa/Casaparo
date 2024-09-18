use crate::application::usecases::shopping_note_usecases::ShoppingNoteUsecases;
use crate::domain::entities::inventory::ShoppingNotes;
use crate::domain::repositories::shopping_note_repository::ShoppingNoteRepository;
use worker::{Request, Response, Result};
use serde_json::from_str;

pub struct ShoppingNoteController<R: ShoppingNoteRepository> {
    usecases: ShoppingNoteUsecases<R>,
}

impl<R: ShoppingNoteRepository> ShoppingNoteController<R> {
    pub fn new(usecases: ShoppingNoteUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_shopping_notes(&self) -> Result<Response> {
        let result = match self.usecases.get_shopping_notes().await {
            Ok(shopping_notes) => shopping_notes,
            Err(e) => return Response::error(e.to_string(), 500)
        };
        Response::from_json(&result)
    }
    
    pub async fn create_shopping_note(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let shopping_note: ShoppingNotes = match from_str(json_body.as_str()) {
            Ok(shopping_note) => shopping_note,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        self.usecases.create_shopping_note(&shopping_note).await?;
        Response::ok("A shopping note was created")
    }

    pub async fn register_to_inventory(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut shopping_note: ShoppingNotes = match from_str(json_body.as_str()) {
            Ok(shopping_note) => shopping_note,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        self.usecases.register_to_inventory(&mut shopping_note).await?;
        Response::ok("A shopping note was registered to inventory")
    }

    pub async fn update_shopping_note(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut shopping_note: ShoppingNotes = match from_str(json_body.as_str()) {
            Ok(shopping_note) => shopping_note,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        self.usecases.update_shopping_note(&mut shopping_note).await?;
        Response::ok("A shopping note was updated")
    }

    pub async fn delete_shopping_note(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut shopping_note: ShoppingNotes = match from_str(json_body.as_str()) {
            Ok(shopping_note) => shopping_note,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        self.usecases.delete_shopping_note(&mut shopping_note).await?;
        Response::ok("A shopping note was deleted")
    }
}