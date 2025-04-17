use crate::application::usecases::wiki_usecases::WikiUsecases;
use crate::domain::entities::wiki::Wikis;
use crate::domain::repositories::wiki_repository::WikiRepository;
use crate::domain::entities::service::JSONResponse;
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
            Ok(wikis) => return Response::from_json(&wikis),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
    }

    pub async fn get_wikis_by_id(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let id = ctx.param("id").unwrap();
        let id_as_u32: u32 = id.parse().unwrap();
        match self.usecases.get_wiki_by_id(id_as_u32).await {
            Ok(wiki) => return Response::from_json(&wiki),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
    }

    pub async fn create_wiki(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let wiki: Wikis = match from_str(json_body.as_str()) {
            Ok(wiki) => wiki,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.create_wiki(&wiki).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Wiki created successfully".to_string()
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

    pub async fn update_wiki(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut wiki: Wikis = match from_str(json_body.as_str()) {
            Ok(wiki) => wiki,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.update_wiki(&mut wiki).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Wiki updated successfully".to_string()
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

    pub async fn delete_wiki(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut wiki: Wikis = match from_str(json_body.as_str()) {
            Ok(wiki) => wiki,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.delete_wiki(&mut wiki).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Wiki deleted successfully".to_string()
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
