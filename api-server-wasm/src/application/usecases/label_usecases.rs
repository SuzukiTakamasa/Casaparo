use crate::domain::entities::setting::{Labels, IsUsed};
use crate::domain::repositories::label_repository::LabelRepository;
use crate::worker_err;
use worker::Result;


pub struct LabelUsecases<R: LabelRepository> {
    repository: R,
}

impl Labels {
    fn validate(&self) -> Result<()> {
        if self.name.len() == 0 {
            return Err(worker_err!("The name must not be empty."));
        }
        if self.label.len() == 0 {
            return Err(worker_err!("The label_type must not be empty."));
        }
        Ok(())
    }
}

impl<R: LabelRepository> LabelUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_labels(&self) -> Result<Vec<Labels>> {
        self.repository.get_labels().await
    }

    pub async fn is_used_for_schedule(&self, id: u32) -> Result<IsUsed> {
        let result = self.repository.get_the_count_of_used_label(id).await?;
        Ok(IsUsed { is_used: result.count_of_used_label > 0})
    }

    pub async fn create_label(&self, label: &Labels) -> Result<()> {
        label.validate()?;
        self.repository.create_label(label).await
    }

    pub async fn update_label(&self, label: &mut Labels) -> Result<()> {
        label.validate()?;
        self.repository.update_label(label).await
    }

    pub async fn delete_label(&self, label: &mut Labels) -> Result<()> {
        label.validate()?;
        self.repository.delete_label(label).await
    }
}