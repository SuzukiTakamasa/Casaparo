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
        let statement = self.d1.prepare("insert into wikis (title, content, created_by, updated_at, image_url, version) values (?1, ?2, ?3, ?4, ?5, ?6)");
        let query = statement.bind(&[wiki.title.into(),
                                     wiki.content.into(),
                                     wiki.created_by.into(),
                                     wiki.updated_at.into(),
                                     wiki.image_url.into(),
                                     wiki.version.into()])?;
        
        let result = match query.run().await {
            Ok(res) => Response::ok("A wiki was created"),
            Err(e) => Response::error("QUery failed", 500)
        };
    }

    async fn update_wiki(&self, wiki: &Wikis) -> Result<(), Error> {

    }

    async fn delete_wiki(&self, wiki: &Wikis) -> Result<(), Error> {

    }
}