use crate::application::usecases::wiki_usecase::WikiUsecases;
use crate::domain::entities::wiki::Wikis;
use worker::{ Request, Response, Result, RouteContext};
use serde_json::from_str;


pub struct WikiController<R: WikiRepository> {
    usecases: WikiUsecases<R>,
}

impl<R: WikiRepository> WikiController<R> {
    pub fn new(usecases: WikiUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_wikis(&self, req: &Request) -> Result<Response> {
        self.usecases.get_wikis().await
    }

    pub async fn get_wikis_by_id(&self, req: &Request, ctx: RouteContext<()>) -> Result<Response> {
        let id = ctx.param("id").unwrap();
        self.usecases.get_wiki_by_id(id).await
    }

    pub async fn create_wiki(&self, mut req: Request) -> Result<Response> {
        let json_body = match req.text() {
            Ok(body) => body,
            Err(e) => Response::error("Bad request", 400)
        };
        let wiki: Wikis = match from_str(json_body.as_str()) {
            Ok(wiki) => wiki,
            Err() => Response::error("Invalid request body", 400)
        };
        self.usecases.create_wiki(wiki).await
    }

    pub async fn update_wiki(&self, mut req: Request) -> Result<Response> {

    }

    pub async fn delete_wiki(&self, mut req: Request) -> Result<Response> {

    }
}