use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct LatestVersion {
    pub version: u32
}

pub trait EntityManager {
    fn increment_version(&mut self);
}