use crate::application::usecases::inventory_type_usecases::InventoryTypeUsecases;
use crate::domain::entities::setting::InventoryTypes;
use crate::domain::repositories::inventory_type_repository::InventoryTypeRepository;
use super::*;

pub struct InventoryTypeController<R: InventoryTypeRepository> {
    usecases: InventoryTypeUsecases<R>,
}

impl<R: InventoryTypeRepository> InventoryTypeController<R> {
    pub fn new(usecases: InventoryTypeUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_inventory_types(&self) -> Result<Response> {
        match self.usecases.get_inventory_types().await {
            Ok(inventory_type) => return JSONResponse::new(Status::Ok, None, Some(inventory_type)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn is_used_for_inventory(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let id = ctx.param("id").unwrap();
        let id_as_u32: u32 = id.parse().unwrap();
        match self.usecases.is_used_for_inventory(id_as_u32).await {
            Ok(is_used) => return JSONResponse::new(Status::Ok, None, Some(is_used)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn create_inventory_type(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let inventory_type: InventoryTypes = match from_str(json_body.as_str()) {
            Ok(inventory_type) => inventory_type,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.create_inventory_type(&inventory_type).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Created, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
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
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn delete_inventory_type(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut inventory_type: InventoryTypes = match from_str(json_body.as_str()) {
            Ok(inventory_type) => inventory_type,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.delete_inventory_type(&mut inventory_type).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }
}
