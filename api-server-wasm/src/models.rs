use serde::{Deserialize, Serialize};


#[derive(Serialize, Deserialize, Debug)]
pub struct Households {
    pub id: Option<u32>,
    pub name: String,
    pub amount: u32,
    pub year: u16,
    pub month: u8,
    pub is_default: u8,
    pub is_owner: u8,
    pub version: u32
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Schedules {
    pub id: Option<u32>,
    pub description: String,
    pub year: u16,
    pub month: u8,
    pub date: u8,
    pub from_time: String,
    pub to_time: String,
    pub version: u32
}