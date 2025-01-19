use crate::domain::entities::wiki_image::WikiImages;
use crate::async_trait::async_trait;
use worker::Result;

#[async_trait(?Send)]
pub trait WikiImageRepository {
    async fn get_wiki_images_by_id(&self, id: u32) -> Result<Vec<WikiImages>>;
    async fn create_wiki_image(&self, wiki_image: &WikiImages) -> Result<()>;
    async fn delete_wiki_image(&self, wiki_image: &WikiImages) -> Result<()>;
}