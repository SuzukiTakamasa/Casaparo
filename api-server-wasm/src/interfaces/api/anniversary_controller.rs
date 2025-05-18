use crate::application::usecases::anniversary_usecases::AnniversaryUsecases;
use crate::domain::entities::setting::Anniversaries;
use crate::domain::repositories::anniversary_repository::AnniversaryRepository;
use super::*;


pub struct AnniversaryController<R: AnniversaryRepository> {
    usecases: AnniversaryUsecases<R>,
}

impl<R: AnniversaryRepository> AnniversaryController<R> {
    pub fn new(usecases: AnniversaryUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_anniversaries(&self) -> Result<Response> {
        match self.usecases.get_anniversaries().await {
            Ok(anniversary) => return JSONResponse::new(Status::Ok, None, Some(anniversary)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn create_anniversary(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let anniversary: Anniversaries = match from_str(json_body.as_str()) {
            Ok(anniversary) => anniversary,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.create_anniversary(&anniversary).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Created, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn update_anniversary(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut anniversary: Anniversaries = match from_str(json_body.as_str()) {
            Ok(anniversary) => anniversary,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.update_anniversary(&mut anniversary).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn delete_anniversary(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut anniversary: Anniversaries = match from_str(json_body.as_str()) {
            Ok(anniversary) => anniversary,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.delete_anniversary(&mut anniversary).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }
}