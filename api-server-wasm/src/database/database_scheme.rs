use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct Households {
    name: String,
    amount: u32,
    year: u16,
    month: u8,
    is_default: u8
}

#[derive(Deserialize, Serialize)]
pub struct Users {
    name: String,
    session_id: String,
    is_owner: u8
}

#[derive(Deserialize, Serialize)]
pub struct Schedules {
    description: String,
    user_id: u64,
    year: u16,
    month: u8,
    date: u8,
    from_time: Datetime<Local>,
    to_time: Datetime<Local>
}