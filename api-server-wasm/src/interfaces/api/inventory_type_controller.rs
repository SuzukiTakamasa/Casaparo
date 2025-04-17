use crate::application::usecases::inventory_type_usecases::InventoryTypeUsecases;
use crate::domain::entities::setting::InventoryTypes;
use crate::domain::repositories::inventory_type_repository::InventoryTypeRepository;
use crate::domain::entities::service::JSONResponse;
use worker::{Request, Response, Result, RouteContext};
use serde_json::from_str;
use crate::AppState;

pub struct InventoryTypeController<R: InventoryTypeRepository> {
    usecases: InventoryTypeUsecases<R>,
}

impl<R: InventoryTypeRepository> InventoryTypeController<R> {
    pub fn new(usecases: InventoryTypeUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_inventory_types(&self) -> Result<Response> {
        match self.usecases.get_inventory_types().await {
            Ok(inventory_type) => return Response::from_json(&inventory_type),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
    }

    pub async fn is_used_for_inventory(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let id = ctx.param("id").unwrap();
        let id_as_u32: u32 = id.parse().unwrap();
        match self.usecases.is_used_for_inventory(id_as_u32).await {
            Ok(is_used) => return Response::from_json(&is_used),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
    }

    pub async fn create_inventory_type(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let inventory_type: InventoryTypes = match from_str(json_body.as_str()) {
            Ok(inventory_type) => inventory_type,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.create_inventory_type(&inventory_type).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Inventory type created successfully".to_string()
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

    pub async fn update_inventory_type(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut inventory_type: InventoryTypes = match from_str(json_body.as_str()) {
            Ok(inventory_type) => inventory_type,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.update_inventory_type(&mut inventory_type).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Inventory type updated successfully".to_string()
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

    pub async fn delete_inventory_type(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut inventory_type: InventoryTypes = match from_str(json_body.as_str()) {
            Ok(inventory_type) => inventory_type,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.delete_inventory_type(&mut inventory_type).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Inventory type deleted successfully".to_string()
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
