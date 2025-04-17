use crate::application::usecases::wiki_image_usecases::WikiImageUsecases;
use crate::domain::entities::wiki_image::WikiImages;
use crate::domain::repositories::wiki_image_repository::WikiImageRepository;
use crate::domain::entities::service::JSONResponse;
use worker::{Request, Response, Result, RouteContext};
use serde_json::from_str;
use crate::AppState;

pub struct WikiImageController<R: WikiImageRepository> {
    usecases: WikiImageUsecases<R>,
}

impl<R: WikiImageRepository> WikiImageController<R> {
    pub fn new(usecases: WikiImageUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_wiki_images_by_id(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let id = ctx.param("id").unwrap();
        let id_as_u32: u32 = id.parse().unwrap();
        match self.usecases.get_wiki_images_by_id(id_as_u32).await {
            Ok(wiki_images) => return Response::from_json(&wiki_images),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
    }

    pub async fn create_wiki_image(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let wiki_image: WikiImages = match from_str(json_body.as_str()) {
            Ok(wiki_image) => wiki_image,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.create_wiki_image(&wiki_image).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Wiki image created successfully".to_string()
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

    pub async fn delete_wiki_image(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut wiki_image: WikiImages = match from_str(json_body.as_str()) {
            Ok(wiki_image) => wiki_image,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.delete_wiki_image(&mut wiki_image).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Wiki image deleted successfully".to_string()
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
