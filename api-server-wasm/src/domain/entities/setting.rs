use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Labels {
    pub id :Option<u32>,
    pub name: String,
    pub label: String,
    pub version: u32
}

#[derive(Serialize, Deserialize, Debug)]
pub struct IsUsed {
    pub is_used: bool
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CountOfUsedLabel {
    pub count_of_used_label: u32
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Anniversaries {
    pub id: Option<u32>,
    pub month: u8,
    pub date: u8,
    pub description: String,
    pub version: u32
}
