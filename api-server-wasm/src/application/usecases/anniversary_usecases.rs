use crate::domain::entities::setting::Anniversaries;
use crate::domain::repositories::anniversary_repository::AnniversaryRepository;
use crate::service::validators::common_validators::{validate_month, validate_date};
use worker::Result;


pub struct AnniversaryUsecases<R: AnniversaryRepository> {
    repository: R,
}

impl Anniversaries {
    fn validate(&self) -> Result<()> {
        validate_month(self.month)?;
        validate_date(self.date)?;
        if self.description.len() == 0 {
            return Err(worker::Error::RustError("The description must not be empty.".to_string()));
        }
        Ok(())
    }
}

impl<R: AnniversaryRepository> AnniversaryUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_anniversaries(&self) -> Result<Vec<Anniversaries>> {
        self.repository.get_anniversaries().await
    }

    pub async fn create_anniversary(&self, anniversary: &Anniversaries) -> Result<()> {
        anniversary.validate()?;
        self.repository.create_anniversary(anniversary).await
    }

    pub async fn update_anniversary(&self, anniversary: &mut Anniversaries) -> Result<()> {
        anniversary.validate()?;
        self.repository.update_anniversary(anniversary).await
    }

    pub async fn delete_anniversary(&self, anniversary: &mut Anniversaries) -> Result<()> {
        anniversary.validate()?;
        self.repository.delete_anniversary(anniversary).await
    }
}