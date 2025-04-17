use crate::application::usecases::inventory_usecases::InventoryUsecases;
use crate::domain::entities::inventory::Inventories;
use crate::domain::repositories::inventory_repository::InventoryRepository;
use crate::domain::entities::service::JSONResponse;
use worker::{Request, Response, Result};
use serde_json::from_str;

pub struct InventoryController<R: InventoryRepository> {
    usecases: InventoryUsecases<R>,
}

impl<R: InventoryRepository> InventoryController<R> {
    pub fn new(usecases: InventoryUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_inventories(&self) -> Result<Response> {
        match self.usecases.get_inventories().await {
            Ok(inventories) => return Response::from_json(&inventories),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
        
    }

    pub async fn create_inventory(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let inventory: Inventories = match from_str(json_body.as_str()) {
            Ok(inventory) => inventory,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.create_inventory(&inventory).await {
            Ok(_) => {
                let sucess_response = JSONResponse {
                    status: 200,
                    message: "Inventory created successfully".to_string()
                };
                return Response::from_json(&sucess_response);
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

    pub async fn update_inventory(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut inventory: Inventories = match from_str(json_body.as_str()) {
            Ok(inventory) => inventory,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.update_inventory(&mut inventory).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Inventory updated successfully".to_string()
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

    pub async fn update_amount(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut inventory: Inventories = match from_str(json_body.as_str()) {
            Ok(inventory) => inventory,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.update_amount(&mut inventory).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Inventory amount updated successfully".to_string()
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

    pub async fn delete_inventory(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut inventory: Inventories = match from_str(json_body.as_str()) {
            Ok(inventory) => inventory,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.delete_inventory(&mut inventory).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Inventory deleted successfully".to_string()
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
