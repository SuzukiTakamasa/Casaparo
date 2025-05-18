use crate::application::usecases::label_usecases::LabelUsecases;
use crate::domain::entities::setting::Labels;
use crate::domain::repositories::label_repository::LabelRepository;
use super::*;

pub struct LabelController<R: LabelRepository> {
    usecases: LabelUsecases<R>,
}

impl<R: LabelRepository> LabelController<R> {
    pub fn new(usecases: LabelUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_labels(&self) -> Result<Response> {
        match self.usecases.get_labels().await {
            Ok(labels) => return JSONResponse::new(Status::Ok, None, Some(labels)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn is_used_for_schedule(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let id = ctx.param("id").unwrap();
        let id_as_u32: u32 = id.parse().unwrap();
        match self.usecases.is_used_for_schedule(id_as_u32).await {
            Ok(is_used) => return JSONResponse::new(Status::Ok, None, Some(is_used)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn create_label(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let label: Labels = match from_str(json_body.as_str()) {
            Ok(label) => label,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.create_label(&label).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Created, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn update_label(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut label: Labels = match from_str(json_body.as_str()) {
            Ok(label) => label,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.update_label(&mut label).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn delete_label(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut label: Labels = match from_str(json_body.as_str()) {
            Ok(label) => label,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.delete_label(&mut label).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }
}
