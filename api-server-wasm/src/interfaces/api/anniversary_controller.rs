use crate::application::usecases::anniversary_usecases::AnniversaryUsecases;
use crate::domain::entities::setting::Anniversaries;
use crate::domain::repositories::anniversary_repository::AnniversaryRepository;
use worker::{Request, Response, Result};
use serde_json::from_str;

pub struct AnniversaryController<R: AnniversaryRepository> {
    usecases: AnniversaryUsecases<R>,
}

impl<R: AnniversaryRepository> AnniversaryController<R> {
    pub fn new(usecases: AnniversaryUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_anniversaries(&self) -> Result<Response> {
        let result = match self.usecases.get_anniversaries().await {
            Ok(anniversarys) => anniversarys,
            Err(e) => return Response::error(e.to_string(), 500)
        };
        Response::from_json(&result)
    }

    pub async fn create_anniversary(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let anniversary: Anniversaries = match from_str(json_body.as_str()) {
            Ok(anniversary) => anniversary,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        self.usecases.create_anniversary(&anniversary).await?;
        Response::ok("An anniversary was created")
    }

    pub async fn update_anniversary(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut anniversary: Anniversaries = match from_str(json_body.as_str()) {
            Ok(anniversary) => anniversary,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        self.usecases.update_anniversary(&mut anniversary).await?;
        Response::ok("An anniversary was updated")
    }

    pub async fn delete_anniversary(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut anniversary: Anniversaries = match from_str(json_body.as_str()) {
            Ok(anniversary) => anniversary,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        self.usecases.delete_anniversary(&mut anniversary).await?;
        Response::ok("An anniversary was updated")
    }
}