use crate::application::usecases::wiki_usecases::WikiUsecases;
use crate::domain::entities::wiki::Wikis;
use crate::domain::repositories::wiki_repository::WikiRepository;
use crate::domain::entities::service::{JSONResponse, Status};
use worker::{Request, Response, Result, RouteContext};
use serde_json::from_str;
use crate::AppState;

pub struct WikiController<R: WikiRepository> {
    usecases: WikiUsecases<R>,
}

impl<R: WikiRepository> WikiController<R> {
    pub fn new(usecases: WikiUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_wikis(&self) -> Result<Response> {
        match self.usecases.get_wikis().await {
            Ok(wikis) => return JSONResponse::new(Status::Ok, None, Some(wikis)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn get_wikis_by_id(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let id = ctx.param("id").unwrap();
        let id_as_u32: u32 = id.parse().unwrap();
        match self.usecases.get_wiki_by_id(id_as_u32).await {
            Ok(wiki) => return JSONResponse::new(Status::Ok, None, Some(wiki)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn create_wiki(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let wiki: Wikis = match from_str(json_body.as_str()) {
            Ok(wiki) => wiki,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.create_wiki(&wiki).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Created, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn update_wiki(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut wiki: Wikis = match from_str(json_body.as_str()) {
            Ok(wiki) => wiki,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.update_wiki(&mut wiki).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn delete_wiki(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut wiki: Wikis = match from_str(json_body.as_str()) {
            Ok(wiki) => wiki,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.delete_wiki(&mut wiki).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }
}
