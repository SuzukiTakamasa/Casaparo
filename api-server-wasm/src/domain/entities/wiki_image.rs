use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]

pub struct WikiImages {
    pub id: Option<u32>,
    pub url: String,
    pub wiki_id: u32,
    pub version: u32
}