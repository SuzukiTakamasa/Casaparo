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
pub struct CompletedHouseholds {
    pub id: Option<u32>,
    pub year: u16,
    pub month: u8,
    pub detail: String,
    pub billing_amount: u32,
    pub total_amount: u32
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RawHouseholdMonthlySummary {
    pub month: u8,
    pub detail: String,
    pub billing_amount: u32,
    pub total_amount: u32
}

#[derive(Serialize, Deserialize, Debug)]
pub struct HouseholdMonthlySummary {
    pub month: u8,
    pub detail: String,
    pub billing_amount: u32,
    pub total_amount: u32
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Detail {
    pub name: String,
    pub amount: u32
}

#[derive(Serialize, Deserialize, Debug)]
pub struct IsCompleted {
    pub is_completed: u8
}