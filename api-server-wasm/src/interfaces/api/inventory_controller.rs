use crate::application::usecases::inventory_usecases::InventoryUsecases;
use crate::domain::entities::inventory::Inventories;
use crate::domain::repositories::inventory_repository::InventoryRepository;
use super::*;

pub struct InventoryController<R: InventoryRepository> {
    usecases: InventoryUsecases<R>,
}

impl<R: InventoryRepository> InventoryController<R> {
    pub fn new(usecases: InventoryUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_inventories(&self) -> Result<Response> {
        match self.usecases.get_inventories().await {
            Ok(inventories) => return JSONResponse::new(Status::Ok, None, Some(inventories)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };   
    }

    pub async fn create_inventory(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let inventory: Inventories = match from_str(json_body.as_str()) {
            Ok(inventory) => inventory,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.create_inventory(&inventory).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Created, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn update_inventory(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut inventory: Inventories = match from_str(json_body.as_str()) {
            Ok(inventory) => inventory,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.update_inventory(&mut inventory).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn update_amount(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut inventory: Inventories = match from_str(json_body.as_str()) {
            Ok(inventory) => inventory,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.update_amount(&mut inventory).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn delete_inventory(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut inventory: Inventories = match from_str(json_body.as_str()) {
            Ok(inventory) => inventory,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.delete_inventory(&mut inventory).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }
}
