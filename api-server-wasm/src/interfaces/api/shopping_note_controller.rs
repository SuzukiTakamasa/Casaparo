use crate::application::usecases::shopping_note_usecases::ShoppingNoteUsecases;
use crate::domain::entities::inventory::ShoppingNotes;
use crate::domain::repositories::shopping_note_repository::ShoppingNoteRepository;
use super::*;

pub struct ShoppingNoteController<R: ShoppingNoteRepository> {
    usecases: ShoppingNoteUsecases<R>,
}

impl<R: ShoppingNoteRepository> ShoppingNoteController<R> {
    pub fn new(usecases: ShoppingNoteUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_shopping_notes(&self) -> Result<Response> {
        match self.usecases.get_shopping_notes().await {
            Ok(shopping_notes) => return JSONResponse::new(Status::Ok, None, Some(shopping_notes)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }
    
    pub async fn create_shopping_note(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let shopping_note: ShoppingNotes = match from_str(json_body.as_str()) {
            Ok(shopping_note) => shopping_note,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.create_shopping_note(&shopping_note).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Created, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn register_shopping_note_to_inventory(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut shopping_note: ShoppingNotes = match from_str(json_body.as_str()) {
            Ok(shopping_note) => shopping_note,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.register_shopping_note_to_inventory(&mut shopping_note).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Created, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn register_to_inventory(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut shopping_note: ShoppingNotes = match from_str(json_body.as_str()) {
            Ok(shopping_note) => shopping_note,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.register_to_inventory(&mut shopping_note).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Created, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn update_shopping_note(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut shopping_note: ShoppingNotes = match from_str(json_body.as_str()) {
            Ok(shopping_note) => shopping_note,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.update_shopping_note(&mut shopping_note).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn delete_shopping_note(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut shopping_note: ShoppingNotes = match from_str(json_body.as_str()) {
            Ok(shopping_note) => shopping_note,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.delete_shopping_note(&mut shopping_note).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }
}
