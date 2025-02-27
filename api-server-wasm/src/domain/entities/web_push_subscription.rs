use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct WebPushSubscription {
    pub id: Option<u32>,
    pub endpoint: String,
    pub p256dh_key: String,
    pub auth_key: String,
    pub version: u32
}