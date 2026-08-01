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

/// The notification body handed to the service worker's `push` listener.
#[derive(Serialize, Deserialize, Debug)]
pub struct BroadcastPayload {
    pub title: String,
    pub body: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>
}

/// Request body of `POST /v2/web_push_subscription/broadcast`. Subscriptions are
/// read from D1 rather than taken from the client, so only the payload matters.
#[derive(Serialize, Deserialize, Debug)]
pub struct BroadcastRequest {
    pub payload: BroadcastPayload
}

#[derive(Serialize, Deserialize, Debug)]
pub struct BroadcastDetail {
    pub subscription_id: String,
    pub status_code: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>
}

#[derive(Serialize, Deserialize, Debug)]
pub struct BroadcastResult {
    pub success: u32,
    pub failed: u32,
    /// Subscriptions dropped from D1 because the push service reported them gone.
    pub expired: u32,
    pub details: Vec<BroadcastDetail>
}
