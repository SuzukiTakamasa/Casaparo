use crate::application::usecases::inventory_usecases::InventoryUsecases;
use crate::domain::entities::inventory::Inventories;
use crate::domain::repositories::inventory_repository::InventoryRepository;
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
        let result = match self.usecases.get_inventories().await {
            Ok(inventories) => inventories,
            Err(e) => return Response::error(e.to_string(), 500)
        };
        Response::from_json(&result)
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
        self.usecases.create_inventory(&inventory).await?;
        Response::ok("A Inventories was created")
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
        self.usecases.update_inventory(&mut inventory).await?;
        Response::ok("A Inventories was updated")
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
        self.usecases.delete_inventory(&mut inventory).await?;
        Response::ok("A Inventories was deleted")
    }
}