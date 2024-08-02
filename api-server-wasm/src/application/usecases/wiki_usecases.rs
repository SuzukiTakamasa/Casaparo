use crate::domain::entities::wiki::Wikis;
use crate::domain::repositories::wiki_repository::WikiRepository;
use worker::Result;

pub struct WikiUsecases<R: WikiRepository> {
    repository: R,
}

impl<R: WikiRepository> WikiUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_wikis(&self) -> Result<Vec<Wikis>> {
        self.repository.get_wikis().await
    }

    pub async fn get_wiki_by_id(&self, id: u32) -> Result<Wikis> {
        self.repository.get_wiki_by_id(id).await
    }

    pub async fn create_wiki(&self, wiki: &Wikis) -> Result<()> {
        self.repository.create_wiki(wiki).await
    }

    pub async fn update_wiki(&self, wiki: &mut Wikis) -> Result<()> {
        self.repository.update_wiki(wiki).await
    }

    pub async fn delete_wiki(&self, wiki: &mut Wikis) -> Result<()> {
        self.repository.delete_wiki(wiki).await
    }
}