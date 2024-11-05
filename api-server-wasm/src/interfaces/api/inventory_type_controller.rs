use crate::application::usecases::inventory_type_usecases::InventoryTypeUsecases;
use crate::domain::entities::setting::InventoryTypes;
use crate::domain::repositories::inventory_type_repository::InventoryTypeRepository;
use crate::domain::entities::service::IsSuccess;
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
        let result = match self.usecases.get_inventory_types().await {
            Ok(inventory_type) => inventory_type,
            Err(e) => return Response::error(e.to_string(), 500)
        };
        Response::from_json(&result)
    }

    pub async fn is_used_for_inventory(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let id = ctx.param("id").unwrap();
        let id_as_u32: u32 = id.parse().unwrap();
        let result = match self.usecases.is_used_for_inventory(id_as_u32).await {
            Ok(is_used) => is_used,
            Err(e) => return Response::error(e.to_string(), 500)
        };
        Response::from_json(&result)
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
        let result = match self.usecases.create_inventory_type(&inventory_type).await {
            Ok(_) => IsSuccess { is_success: 1 },
            Err(e) => return Response::error(format!("Internal server error: {}", e), 500)
        };
        Response::from_json(&result)
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
        let result = match self.usecases.update_inventory_type(&mut inventory_type).await {
            Ok(_) => IsSuccess { is_success: 1 },
            Err(e) => return Response::error(format!("Internal server error: {}", e), 500)
        };
        Response::from_json(&result)
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
        let result = match self.usecases.delete_inventory_type(&mut inventory_type).await {
            Ok(_) => IsSuccess { is_success: 1 },
            Err(e) => return Response::error(format!("Internal server error: {}", e), 500)
        };
        Response::from_json(&result)
    }
}