use crate::domain::entities::shift::Shift;
use crate::domain::repositories::shift_repository::ShiftRepository;
use worker::Result;

pub struct ShiftUsecases<R: ShiftRepository> {
    repository: R,
}

impl<R: ShiftRepository> ShiftUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn get_shifts(&self) -> Result<Vec<Shift>> {
        self.repository.get_shifts().await
    }

    pub async fn get_shifts_by_year_month(&self, year: u32, month: u32) -> Result<Vec<Shift>> {
        self.repository.get_shifts_by_year_month(year, month).await
    }

    pub async fn create_shift(&self, shift: &Shift) -> Result<()> {
        self.repository.create_shift(shift).await
    }

    pub async fn update_shift(&self, shift: &mut Shift) -> Result<()> {
        self.repository.update_shift(shift).await
    }

    pub async fn delete_shift(&self, shift: &mut Shift) -> Result<()> {
        self.repository.delete_shift(shift).await
    }
}
