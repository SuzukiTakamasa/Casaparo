use crate::domain::entities::Wikis;
use crate::domain::repositories::wiki_repository::WikiRepository;

pub struct WikiUsecases<R: WikiRepository> {
    repository: R,
}

impl<R: WikiRepository> WikiRrepository<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_wikis(&self) -> Result<Vec<Wikis>, Error> {
        self.repository.get_wikis().await
    }

    pub async fn get_wiki_by_id(&self, id: u32) -> Result<Wikis: Error> {

    }

    pub async fn create_wiki(&self, wiki: &Wikis) -> Result<(), Error> {
        self.repository.create_wiki(wiki).await
    }

    pub async fn update_wiki(&self, wiki: &wasiki) -> Result<(), Error> {
        self.repository.updatewiki(wiki).await
    }

    pub async fn delete_wiki(&self, wiki: &Wiki) -> Result<(), Error> {
        self.repository.delte(wiki.id).await
    }
}