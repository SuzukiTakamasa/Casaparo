use crate::application::usecases::shopping_note_usecases::ShoppingNoteUsecases;
use crate::domain::entities::inventory::ShoppingNotes;
use crate::domain::repositories::shopping_note_repository::ShoppingNoteRepository;
use crate::domain::entities::service::JSONResponse;
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
        match self.usecases.get_shopping_notes().await {
            Ok(shopping_notes) => return Response::from_json(&shopping_notes),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
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
        match self.usecases.create_shopping_note(&shopping_note).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Shopping note created successfully".to_string()
                };
                return Response::from_json(&success_response);
            },
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
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
        match self.usecases.register_to_inventory(&mut shopping_note).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Shopping note registered to inventory successfully".to_string()
                };
                return Response::from_json(&success_response);
            },
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
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
        match self.usecases.update_shopping_note(&mut shopping_note).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Shopping note updated successfully".to_string()
                };
                return Response::from_json(&success_response);
            },
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
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
        match self.usecases.delete_shopping_note(&mut shopping_note).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Shopping note deleted successfully".to_string()
                };
                return Response::from_json(&success_response);
            },
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
    }
}
