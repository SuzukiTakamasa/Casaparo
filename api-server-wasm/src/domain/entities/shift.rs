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

/// Body of the schema migration patch: the rows fetched from the old table,
/// handed back so they can be re-inserted after `shifts` is rebuilt.
#[derive(Serialize, Deserialize, Debug)]
pub struct ShiftMigration {
    pub shifts: Vec<Shift>,
}
