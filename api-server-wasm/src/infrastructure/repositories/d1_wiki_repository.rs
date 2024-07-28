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
        let query = self.d1.prepare("select * from wikis order by id desc");
        let result = match query.all().await {
            Ok(res) => res,
            Err(e) => e
        };
        match result.results::<Wikis>() {
            Ok(wikis) => wikis,
            Err(e) => e
        }
    }

    async fn get_wiki_by_id(&self, id: u32) -> Result<Wikis, Error> {
        let statement = self.d1.prepare("select * from wikis where id = ?1");
        let query = statement.bind(&[id.into()])?;
        match query.first::<Wikis>(None).await {
            Ok(wiki_detail) => wiki_detail,
            Err(e) => e
        }
    }

    async fn create_wiki(&self, wiki: &Wikis) -> Result<(), Error> {

    }

    async fn update_wiki(&self, wiki: &Wikis) -> Result<(), Error> {

    }

    async fn delete_wiki(&self, wiki: &Wikis) -> Result<(), Error> {

    }
}