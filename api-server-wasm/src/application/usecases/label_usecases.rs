use crate::domain::entities::setting::Labels;
use crate::domain::repositories::label_repository::LabelRepository;
use worker::Result;


pub struct LabelUsecases<R: LabelRepository> {
    repository: R,
}

impl<R: LabelRepository> LabelUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_labels(&self) -> Result<Vec<Labels>> {
        self.repository.get_labels().await
    }

    pub async fn create_label(&self, label: &Labels) -> Result<()> {
        self.repository.create_label(label).await
    }

    pub async fn update_label(&self, label: &mut Labels) -> Result<()> {
        self.repository.update_label(label).await
    }

    pub async fn delete_label(&self, label: &mut Labels) -> Result<()> {
        self.repository.delete_label(label).await
    }
}