use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Schedules {
    pub id: Option<u32>,
    pub description: String,
    pub from_year: u16,
    pub to_year: u16,
    pub from_month: u8,
    pub to_month: u8,
    pub from_date: u8,
    pub to_date: u8,
    pub from_time: String,
    pub to_time: String,
    pub created_by: u8,
    pub label_id: u32,
    pub version: u32,
    pub label: Option<String>
}