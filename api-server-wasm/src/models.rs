use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Household {
    name: String,
    amount: u32,
    year: u16,
    month: u8,
    is_default: bool,
    is_owner: bool,
}

#[derive(Serialize, Deserialize)]
pub struct Schedule {
    description: String,
    year: u16,
    month: u8,
    date: u8,
    from_time: String, // ISO8601形式
    to_time: String,   // ISO8601形式
}