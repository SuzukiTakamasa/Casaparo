use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct LatestVersion {
    pub version: u32
}

#[derive(Serialize, Deserialize, Debug)]
pub struct IsSuccess {
    pub is_success: u8
}