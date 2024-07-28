use crate::application::usecases::wiki_usecase::WikiUsecases;
use crate::domain::entities::wiki::Wikis;
use worker::{ Request, Response, Result };

pub struct WikiController<R: WikiRepository> {
    usecases: WikiUsecases<R>,
}

impl<R: WikiRepository> WikiController<R> {
    pub fn new(usecases: WikiUsecases<R>) -> Self {
        Self { usecases }
    }

    pub fn get_wikis(&self, req: &Request) -> Result<Response> {

    }

    pub fn get_wikis_by_id(&self, req: &Request) -> Result<Response> {
        
    }

    pub fn create_wiki(&self, mut req: Request) -> Result<Response> {

    }

    pub fn update_wiki(&self, mut req: Request) -> Result<Response> {

    }

    pub fn delete_wiki(&self, mut req: Request) -> Result<Response> {

    }
}