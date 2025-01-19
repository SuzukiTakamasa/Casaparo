use crate::application::usecases::wiki_image_usecases::WikiImageUsecases;
use crate::domain::entities::wiki_image::WikiImages;
use crate::domain::repositories::wiki_image_repository::WikiImageRepository;
use crate::domain::entities::service::IsSuccess;
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
        let result = match self.usecases.get_wiki_images_by_id(id_as_u32).await {
            Ok(wiki_images) => wiki_images,
            Err(e) => return Response::error(e.to_string(), 500)
        };
        Response::from_json(&result)
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
        let result = match self.usecases.create_wiki_image(&wiki_image).await {
            Ok(_) => IsSuccess { is_success: 1 },
            Err(e) => return Response::error(format!("Internal server error: {}", e), 500)
        };
        Response::from_json(&result)
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
        let result = match self.usecases.delete_wiki_image(&mut wiki_image).await {
            Ok(_) => IsSuccess { is_success: 1 },
            Err(e) => return Response::error(format!("Internal server error: {}", e), 500)
        };
        Response::from_json(&result)
    }
}