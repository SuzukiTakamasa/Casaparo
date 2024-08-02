use serde::{Deserialize, Serialize};

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

impl Wikis {
    pub fn increment_version(&mut self) {
        self.version += 1
    }
}