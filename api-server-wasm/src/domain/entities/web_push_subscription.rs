use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct WebPushSubscription {
    pub id: Option<u32>,
    pub subscription_id: String,
    pub endpoint: String,
    pub p256h_key: String,
    pub auth_key: String,
    pub version: u32
}