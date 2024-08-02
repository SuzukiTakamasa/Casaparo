use serde::{Deserialize, Serialize};
use crate::domain::entities::service::EntityManager;

#[derive(Serialize, Deserialize, Debug)]
pub struct Wikis {
    pub id: Option<u32>,
    pub title: String,
    pub content: String,
    pub created_by: u8,
    pub updated_at: String,
    pub image_url: Option<String>,
    pub version: u32
}

impl EntityManager for Wikis {
    fn increment_version(&mut self) {
        self.version += 1
    }
}