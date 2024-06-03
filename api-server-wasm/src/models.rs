use serde::{Deserialize, Serialize};


#[derive(Serialize, Deserialize, Debug)]
pub struct Households {
    pub id: Option<u32>,
    pub name: String,
    pub amount: u32,
    pub year: Option<u16>,
    pub month: Option<u8>,
    pub is_default: u8,
    pub is_owner: u8,
    pub version: u32
}

#[derive(Serialize, Deserialize, Debug)]
pub struct FixedAmount {
    pub billing_amount: i32,
    pub total_amount: u32
}

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

#[derive(Serialize, Deserialize, Debug)]
pub struct LatestVersion {
    pub version: u32
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CompletedHouseholds {
    pub id: Option<u32>,
    pub year: u16,
    pub month: u8,
    pub billing_amount: u32,
    pub total_amount: u32
}

#[derive(Serialize, Deserialize, Debug)]
pub struct HouseholdMonthlySummary {
    pub month: u8,
    pub billing_amount: u32,
    pub total_amount: u32
}

#[derive(Serialize, Deserialize, Debug)]
pub struct IsCompleted {
    pub is_completed: u8
}

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

#[derive(Serialize, Deserialize, Debug)]
pub struct Labels {
    pub id :Option<u32>,
    pub name: String,
    pub label: String,
    pub version: u32
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Anniversaries {
    pub id: Option<u32>,
    pub month: u8,
    pub date: u8,
    pub description: String,
    pub version: u32
}