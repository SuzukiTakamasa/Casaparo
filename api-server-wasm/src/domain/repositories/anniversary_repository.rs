use crate::domain::entities::setting::Anniversaries;
use crate::async_trait::async_trait;
use worker::Result;

#[async_trait(?Send)]
pub trait AnniversaryRepository {
    async fn get_anniversaries(&self) -> Result<Vec<Anniversaries>>;
    async fn get_today_or_tomorrow_anniversaries(&self, month: u8, day: u8) -> Result<Vec<Anniversaries>>;
    async fn create_anniversary(&self, anniversary: &Anniversaries) -> Result<()>;
    async fn update_anniversary(&self, anniversary: &mut Anniversaries) -> Result<()>;
    async fn delete_anniversary(&self, anniversary: &mut Anniversaries) -> Result<()>;
}