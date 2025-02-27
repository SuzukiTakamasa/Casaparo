use crate::domain::entities::web_push_subscription::WebPushSubscription;
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::web_push_subscription_repository::WebPushSubscriptionRepository;
use crate::async_trait::async_trait;
use worker::{D1Database, Result};
use std::sync::Arc;

pub struct D1WebPushSubscriptionRepository {
    db: Arc<D1Database>,
}

impl D1WebPushSubscriptionRepository {
    pub fn new(db: Arc<D1Database>) -> Self {
        Self { db }
    }
}

#[async_trait(?Send)]
impl WebPushSubscriptionRepository for D1WebPushSubscriptionRepository {
    async fn get_web_push_subscriptions(&self) -> Result<Vec<WebPushSubscription>> {
        let query = self.db.prepare(r#"select
                                                            *
                                                            from web_push_subscriptions
                                                            order by id desc"#);
        let result = query.all().await?;
        result.results::<WebPushSubscription>()
    }

    async fn create_web_push_subscription(&self, web_push_subscription: &WebPushSubscription) -> Result<()> {
        let statement = self.db.prepare(r#"insert into web_push_subscriptions
                                                                (endpoint, p256dh_key, auth_key, version)
                                                                values (?1, ?2, ?3, ?4)"#);
        let query = statement.bind(&[web_push_subscription.endpoint.clone().into(),
                                                        web_push_subscription.p256dh_key.clone().into(),
                                                        web_push_subscription.auth_key.clone().into(),
                                                        web_push_subscription.version.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn delete_web_push_subscription(&self, web_push_subscription: &mut WebPushSubscription) -> Result<()> {
        let fetch_version_statement = self.db.prepare(r#"select
                                                                              version
                                                                              from web_push_subscriptions
                                                                              where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[web_push_subscription.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        if let Some(latest) = fetch_version_result {
            if web_push_subscription.version == latest.version {
                web_push_subscription.version += 1;
            } else {
                return Err(worker::Error::RustError("Attempt to update a stale object".to_string()))
            }
        } else {
            return Err(worker::Error::RustError("Version is found None".to_string()))
        }
        let statement = self.db.prepare(r#"delete from web_push_subscriptions
                                                                where id = ?1"#);
        let query = statement.bind(&[web_push_subscription.id.into()])?;
        query.run().await?;
        Ok(())
    }
}