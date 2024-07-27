use crate::domain::entities::wiki::Wikis;
use async_trait::async_trait;

#[async_trait]
pub trait WikiRepository {
    async fn get_wikis(&self) -> Result<Vec<Wikis>, Error>;
    async fn get_wiki_by_id(&self, id: u32) -> Result<Wikis, Error>;
    async fn create_wiki(&self, wiki: &Wikis) -> Result<(), Erorr>;
    async fn update_wiki(&self, wiki: &Wikis) -> Result<(), Error>;
    async fn delete_wiki(&self, wiki: &Wikis) -> Result<(), Error>;
}