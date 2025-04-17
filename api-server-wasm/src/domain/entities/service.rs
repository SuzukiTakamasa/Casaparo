use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct LatestVersion {
    pub version: u32
}

#[derive(Serialize, Deserialize, Debug)]
pub struct JSONResponse {
    pub status: u16,
    pub message: String,
}