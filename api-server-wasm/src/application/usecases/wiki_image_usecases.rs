use crate::domain::entities::wiki_image::WikiImages;
use crate::domain::repositories::wiki_image_repository::WikiImageRepository;
use crate::worker_err;
use worker::Result;


pub struct WikiImageUsecases<R: WikiImageRepository> {
    repository: R,
}

impl WikiImages {
    fn validate(&self) -> Result<()> {
        if self.url.len() == 0 {
            return Err(worker_err!("The image_url must not be empty."));
        }
        Ok(())
    }
}

impl<R: WikiImageRepository> WikiImageUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_wiki_images_by_id(&self, id: u32) -> Result<Vec<WikiImages>> {
        self.repository.get_wiki_images_by_id(id).await
    }

    pub async fn create_wiki_image(&self, wiki_image: &WikiImages) -> Result<()> {
        wiki_image.validate()?;
        self.repository.create_wiki_image(wiki_image).await
    }

    pub async fn delete_wiki_image(&self, wiki_image: &mut WikiImages) -> Result<()> {
        wiki_image.validate()?;
        self.repository.delete_wiki_image(wiki_image).await
    }
}