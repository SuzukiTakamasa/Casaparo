use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Household {
    name: String,
    amount: u32,
    year: u16,
    month: u8,
    is_default: bool,
    is_owner: bool,
    version: u32
}

#[derive(Serialize, Deserialize)]
pub struct Schedule {
    description: String,
    year: u16,
    month: u8,
    date: u8,
    from_time: String,
    to_time: String,
    version: u32
}