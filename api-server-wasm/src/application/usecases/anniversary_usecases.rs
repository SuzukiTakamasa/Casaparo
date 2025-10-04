use crate::domain::entities::setting::Anniversaries;
use crate::domain::repositories::anniversary_repository::AnniversaryRepository;
use worker::Result;


pub struct AnniversaryUsecases<R: AnniversaryRepository> {
    repository: R,
}

impl<R: AnniversaryRepository> AnniversaryUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_anniversaries(&self) -> Result<Vec<Anniversaries>> {
        self.repository.get_anniversaries().await
    }

    pub async fn get_today_or_tomorrow_anniversaries(&self, month: u8, day: u8) -> Result<Vec<Anniversaries>> {
        self.repository.get_today_or_tomorrow_anniversaries(month, day).await
    }

    pub async fn create_anniversary(&self, anniversary: &Anniversaries) -> Result<()> {
        self.repository.create_anniversary(anniversary).await
    }

    pub async fn update_anniversary(&self, anniversary: &mut Anniversaries) -> Result<()> {
        self.repository.update_anniversary(anniversary).await
    }

    pub async fn delete_anniversary(&self, anniversary: &mut Anniversaries) -> Result<()> {
        self.repository.delete_anniversary(anniversary).await
    }
}