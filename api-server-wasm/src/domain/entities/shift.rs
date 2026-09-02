use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Shift {
    pub id: Option<u32>,
    pub year: u32,
    pub month: u32,
    pub date: u32,
    pub work: String,
    pub working_hour_from: f64,
    pub working_hour_to: f64,
    pub hourly_wage: u32,
    pub transportation_expense: Option<u32>,
    pub version: u32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AnnualIncome {
    pub annual_income: u32
}