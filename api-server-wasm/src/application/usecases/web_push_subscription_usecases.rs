use crate::domain::entities::web_push_subscription::{
    BroadcastDetail, BroadcastPayload, BroadcastResult, WebPushSubscription,
};
use crate::domain::repositories::web_push_subscription_repository::WebPushSubscriptionRepository;
use crate::services::web_push::{send_notification, VapidConfig};
use crate::worker_error;
use worker::{console_error, Result};

/// Status codes a push service returns for a subscription that no longer exists.
const GONE_STATUS_CODES: [u16; 2] = [404, 410];

pub struct WebPushSubscriptionUsecases<R: WebPushSubscriptionRepository> {
    repository: R,
    vapid: Option<VapidConfig>,
}

impl<R: WebPushSubscriptionRepository> WebPushSubscriptionUsecases<R> {
    pub fn new(repository: R, vapid: Option<VapidConfig>) -> Self {
        Self { repository, vapid }
    }

    pub async fn get_web_push_subscriptions(&self) -> Result<Vec<WebPushSubscription>> {
        self.repository.get_web_push_subscriptions().await
    }

    pub async fn get_web_push_subscription_by_subscription_id(&self, subscription_id: &str) -> Result<WebPushSubscription> {
        self.repository.get_web_push_subscription_by_subscription_id(subscription_id).await
    }

    pub async fn create_web_push_subscription(&self, web_push_subscription: &WebPushSubscription) -> Result<()> {
        self.repository.create_web_push_subscription(web_push_subscription).await
    }

    pub async fn delete_web_push_subscription(&self, web_push_subscription: &mut WebPushSubscription) -> Result<()> {
        self.repository.delete_web_push_subscription(web_push_subscription).await
    }

    /// Sends `payload` to every stored subscription. Delivery failures never
    /// abort the run: each subscription gets its own entry in the result, and
    /// the ones the push service reports as gone are removed from D1.
    pub async fn broadcast(&self, payload: &BroadcastPayload) -> Result<BroadcastResult> {
        let vapid = match self.vapid.as_ref() {
            Some(vapid) => vapid,
            None => return worker_error!("VAPID keys are not configured on this worker"),
        };

        let subscriptions = self.repository.get_web_push_subscriptions().await?;
        let serialized_payload = serde_json::to_string(payload)?;

        let mut result = BroadcastResult {
            success: 0,
            failed: 0,
            expired: 0,
            details: Vec::with_capacity(subscriptions.len()),
        };

        for subscription in subscriptions.iter() {
            let detail = match send_notification(vapid, subscription, &serialized_payload).await {
                Ok(response) if (200..300).contains(&response.status_code) => {
                    result.success += 1;
                    BroadcastDetail {
                        subscription_id: subscription.subscription_id.clone(),
                        status_code: response.status_code,
                        message: None,
                    }
                }
                Ok(response) => {
                    let status_code = response.status_code;
                    result.failed += 1;
                    if GONE_STATUS_CODES.contains(&status_code) {
                        // Best effort: a failed cleanup must not fail the broadcast.
                        match self
                            .repository
                            .delete_expired_web_push_subscription(&subscription.subscription_id)
                            .await
                        {
                            Ok(_) => result.expired += 1,
                            Err(e) => console_error!("Failed to delete an expired subscription: {}", e),
                        }
                    }
                    console_error!(
                        "The push service rejected a notification with {}: {}",
                        status_code,
                        response.body
                    );
                    BroadcastDetail {
                        subscription_id: subscription.subscription_id.clone(),
                        status_code,
                        message: Some(format!(
                            "The push service responded with {} {}",
                            status_code, response.body
                        )),
                    }
                }
                Err(e) => {
                    result.failed += 1;
                    console_error!("Failed to send a web push notification: {}", e);
                    BroadcastDetail {
                        subscription_id: subscription.subscription_id.clone(),
                        status_code: 0,
                        message: Some(e.to_string()),
                    }
                }
            };
            result.details.push(detail);
        }

        Ok(result)
    }
}
