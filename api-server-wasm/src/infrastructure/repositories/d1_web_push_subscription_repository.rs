use crate::domain::entities::web_push_subscription::WebPushSubscription;
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::web_push_subscription_repository::WebPushSubscriptionRepository;
use crate::{optimistic_lock, worker_error};
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

    async fn get_web_push_subscription_by_subscription_id(&self, subscription_id: &str) -> Result<WebPushSubscription> {
        let statement = self.db.prepare(r#"select
                                                                *
                                                                from web_push_subscriptions
                                                                where subscription_id = ?1"#);
        let query = statement.bind(&[subscription_id.into()])?;
        let result = query.first::<WebPushSubscription>(None).await?;
        match result {
            Some(web_push_subscription) => Ok(web_push_subscription),
            None => worker_error!(format!("A web push subscription with subscription_id {} is not found.", subscription_id))
        }
    }

    async fn create_web_push_subscription(&self, web_push_subscription: &WebPushSubscription) -> Result<()> {
        let statement = self.db.prepare(r#"insert into web_push_subscriptions
                                                                (subscription_id, endpoint, p256h_key, auth_key, version)
                                                                values (?1, ?2, ?3, ?4, ?5)"#);
        let query = statement.bind(&[web_push_subscription.subscription_id.clone().into(),
                                                          web_push_subscription.endpoint.clone().into(),
                                                          web_push_subscription.p256h_key.clone().into(),
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
        optimistic_lock!(fetch_version_result, web_push_subscription);
        
        let statement = self.db.prepare(r#"delete from web_push_subscriptions
                                                                where subscription_id = ?1"#);
        let query = statement.bind(&[web_push_subscription.subscription_id.clone().into()])?;
        query.run().await?;
        Ok(())
    }
}