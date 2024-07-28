use crate::domain::entities::Wikis;
use crate::domain::repositories::wiki_repository::WikiRepository;
use worker::D1Database;

pub struct D1WikiRepository {
    db: D1Database,
}

impl D1WikiRepository {
    pub fn new(db: D1Database) -> Self {
        Self { db }
    }
}

#[async_trait]
impl WikiRepository for D1WikiRepository {
    async fn get_wikis(&self) -> Result<Vec<Wikis>, Error> {

    }

    async fn get_wiki_by_id(&self, id: u32) -> Result<Wikis, Error> {

    }

    async fn create_wiki(&self, wiki: &Wikis) -> Result<(), Error> {

    }

    async fn update_wiki(&self, wiki: &Wikis) -> Result<(), Error> {

    }

    async fn delete_wiki(&self, wiki: &Wikis) -> Result<(), Error> {

    }
}