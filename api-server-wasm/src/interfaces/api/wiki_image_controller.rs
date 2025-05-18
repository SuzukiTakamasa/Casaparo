use crate::application::usecases::wiki_image_usecases::WikiImageUsecases;
use crate::domain::entities::wiki_image::WikiImages;
use crate::domain::repositories::wiki_image_repository::WikiImageRepository;
use super::*;

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
            Ok(wiki_images) => return JSONResponse::new(Status::Ok, None, Some(wiki_images)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn create_wiki_image(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let wiki_image: WikiImages = match from_str(json_body.as_str()) {
            Ok(wiki_image) => wiki_image,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.create_wiki_image(&wiki_image).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Created, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn delete_wiki_image(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut wiki_image: WikiImages = match from_str(json_body.as_str()) {
            Ok(wiki_image) => wiki_image,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.delete_wiki_image(&mut wiki_image).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }
}
