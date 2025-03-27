use crate::domain::entities::web_push_subscription::WebPushSubscription;
use crate::domain::repositories::web_push_subscription_repository::WebPushSubscriptionRepository;
use crate::worker_err;
use worker::Result;

pub struct WebPushSubscriptionUsecases<R: WebPushSubscriptionRepository> {
    repository: R,
}

impl WebPushSubscription {
    fn validate(&self) -> Result<()> {
        if self.subscription_id.len() == 0 {
            return Err(worker_err!("The subscription_id must not be empty."));
        }
        if self.endpoint.len() == 0 {
            return Err(worker_err!("The endpoint must not be empty."));
        }
        if self.auth_key.len() == 0 {
            return Err(worker_err!("The auth must not be empty."));
        }
        if self.p256h_key.len() == 0 {
            return Err(worker_err!("The p256dh must not be empty."));
        }
        Ok(())
    }
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
        web_push_subscription.validate()?;
        self.repository.create_web_push_subscription(web_push_subscription).await
    }

    pub async fn delete_web_push_subscription(&self, web_push_subscription: &mut WebPushSubscription) -> Result<()> {
        web_push_subscription.validate()?;
        self.repository.delete_web_push_subscription(web_push_subscription).await
    }
}