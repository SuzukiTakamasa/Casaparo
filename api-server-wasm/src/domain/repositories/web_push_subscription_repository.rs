use crate::domain::entities::web_push_subscription::WebPushSubscription;
use crate::async_trait::async_trait;
use worker::Result;

#[async_trait(?Send)]
pub trait WebPushSubscriptionRepository {
    async fn get_web_push_subscriptions(&self) -> Result<Vec<WebPushSubscription>>;
    async fn get_web_push_subscription_by_subscription_id(&self, subscription_id: &str) -> Result<Option<WebPushSubscription>>;
    async fn create_web_push_subscription(&self, web_push_subscription: &WebPushSubscription) -> Result<()>;
    async fn delete_web_push_subscription(&self, web_push_subscription: &mut WebPushSubscription) -> Result<()>;
}