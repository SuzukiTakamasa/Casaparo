use crate::domain::entities::wiki::Wikis;
use crate::domain::repositories::wiki_repository::WikiRepository;
use crate::worker_err;
use worker::Result;


pub struct WikiUsecases<R: WikiRepository> {
    repository: R,
}

impl Wikis {
    fn validate(&self) -> Result<()> {
        if self.title.len() == 0 {
            return Err(worker_err!("The title must not be empty."));
        }
        if self.content.len() == 0 {
            return Err(worker_err!("The content must not be empty."));
        }
        if self.created_by != 0 || self.created_by != 1 {
            return Err(worker_err!("The created_by must be 0 or 1."));
        }
        if self.updated_at.len() == 0 {
            return Err(worker_err!("The updated_at must not be empty."));
        }
        Ok(())
    }
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
        wiki.validate()?;
        self.repository.create_wiki(wiki).await
    }

    pub async fn update_wiki(&self, wiki: &mut Wikis) -> Result<()> {
        wiki.validate()?;
        self.repository.update_wiki(wiki).await
    }

    pub async fn delete_wiki(&self, wiki: &mut Wikis) -> Result<()> {
        wiki.validate()?;
        self.repository.delete_wiki(wiki).await
    }
}