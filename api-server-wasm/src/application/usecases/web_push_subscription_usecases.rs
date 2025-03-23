use crate::domain::entities::web_push_subscription::WebPushSubscription;
use crate::domain::repositories::web_push_subscription_repository::WebPushSubscriptionRepository;
use worker::Result;

pub struct WebPushSubscriptionUsecases<R: WebPushSubscriptionRepository> {
    repository: R,
}

impl<R: WebPushSubscriptionRepository> WebPushSubscriptionUsecases<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
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
}