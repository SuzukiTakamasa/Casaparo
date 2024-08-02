use crate::domain::entities::wiki::Wikis;
use crate::async_trait::async_trait;
use worker::Result;

#[async_trait(?Send)]
pub trait WikiRepository {
    async fn get_wikis(&self) -> Result<Vec<Wikis>>;
    async fn get_wiki_by_id(&self, id: u32) -> Result<Wikis>;
    async fn create_wiki(&self, wiki: &Wikis) -> Result<()>;
    async fn update_wiki(&self, wiki: &mut Wikis) -> Result<()>;
    async fn delete_wiki(&self, wiki: &mut Wikis) -> Result<()>;
}