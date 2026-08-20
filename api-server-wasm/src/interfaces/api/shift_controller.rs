use crate::application::usecases::shift_usecases::ShiftUsecases;
use crate::domain::entities::shift::Shift;
use crate::domain::repositories::shift_repository::ShiftRepository;
use super::*;

pub struct ShiftController<R: ShiftRepository> {
    usecases: ShiftUsecases<R>,
}

impl<R: ShiftRepository> ShiftController<R> {
    pub fn new(usecases: ShiftUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_shifts(&self) -> Result<Response> {
        match self.usecases.get_shifts().await {
            Ok(shifts) => JSONResponse::build(Status::Ok, None, Some(shifts)),
            Err(e) => JSONResponse::<()>::build(Status::InternalServerError, Some(e.to_string()), None),
        }
    }

    pub async fn get_shifts_by_year_month(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let year: u32 = match ctx.param("year").and_then(|v| v.parse().ok()) {
            Some(v) => v,
            None => return JSONResponse::<()>::build(Status::BadRequest, Some("Invalid year".to_string()), None),
        };
        let month: u32 = match ctx.param("month").and_then(|v| v.parse().ok()) {
            Some(v) => v,
            None => return JSONResponse::<()>::build(Status::BadRequest, Some("Invalid month".to_string()), None),
        };
        match self.usecases.get_shifts_by_year_month(year, month).await {
            Ok(shifts) => JSONResponse::build(Status::Ok, None, Some(shifts)),
            Err(e) => JSONResponse::<()>::build(Status::InternalServerError, Some(e.to_string()), None),
        }
    }

    pub async fn create_shift(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::build(Status::BadRequest, Some("Bad request".to_string()), None),
        };
        let shift: Shift = match from_str(json_body.as_str()) {
            Ok(shift) => shift,
            Err(_) => return JSONResponse::<()>::build(Status::BadRequest, Some("Invalid request body".to_string()), None),
        };
        match self.usecases.create_shift(&shift).await {
            Ok(_) => JSONResponse::<()>::build(Status::Created, None, None),
            Err(e) => JSONResponse::<()>::build(Status::InternalServerError, Some(e.to_string()), None),
        }
    }

    pub async fn update_shift(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::build(Status::BadRequest, Some("Bad request".to_string()), None),
        };
        let mut shift: Shift = match from_str(json_body.as_str()) {
            Ok(shift) => shift,
            Err(_) => return JSONResponse::<()>::build(Status::BadRequest, Some("Invalid request body".to_string()), None),
        };
        match self.usecases.update_shift(&mut shift).await {
            Ok(_) => JSONResponse::<()>::build(Status::Ok, None, None),
            Err(e) => JSONResponse::<()>::build(Status::InternalServerError, Some(e.to_string()), None),
        }
    }

    pub async fn delete_shift(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::build(Status::BadRequest, Some("Bad request".to_string()), None),
        };
        let mut shift: Shift = match from_str(json_body.as_str()) {
            Ok(shift) => shift,
            Err(_) => return JSONResponse::<()>::build(Status::BadRequest, Some("Invalid request body".to_string()), None),
        };
        match self.usecases.delete_shift(&mut shift).await {
            Ok(_) => JSONResponse::<()>::build(Status::Ok, None, None),
            Err(e) => JSONResponse::<()>::build(Status::InternalServerError, Some(e.to_string()), None),
        }
    }
}
