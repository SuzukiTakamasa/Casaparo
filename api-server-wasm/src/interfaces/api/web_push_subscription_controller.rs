use crate::application::usecases::web_push_subscription_usecases::WebPushSubscriptionUsecases;
use crate::domain::repositories::web_push_subscription_repository::WebPushSubscriptionRepository;
use crate::domain::entities::web_push_subscription::WebPushSubscription;
use crate::domain::entities::service::IsSuccess;
use worker::{Result, RouteContext};
use worker::{Request, Response};
use serde_json::from_str;
use crate::AppState;

pub struct WebPushSubscriptionController<R: WebPushSubscriptionRepository> {
    usecases: WebPushSubscriptionUsecases<R>,
}

impl<R: WebPushSubscriptionRepository> WebPushSubscriptionController<R> {
    pub fn new(usecases: WebPushSubscriptionUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_web_push_subscriptions(&self) -> Result<Response> {
        let result = match self.usecases.get_web_push_subscriptions().await {
            Ok(web_push_subscription) => web_push_subscription,
            Err(e) => return Response::error(e.to_string(), 500)
        };
        Response::from_json(&result)
    }

    pub async fn get_web_push_subscription_by_subscription_id(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let subscription_id = ctx.param("subscription_id").unwrap();
        let result = match self.usecases.get_web_push_subscription_by_subscription_id(subscription_id).await {
            Ok(web_push_subscription) => web_push_subscription,
            Err(e) => return Response::error(e.to_string(), 500)
        };
        Response::from_json(&result)
    }

    pub async fn create_web_push_subscription(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let web_push_subscription: WebPushSubscription = match from_str(json_body.as_str()) {
            Ok(web_push_subscription) => web_push_subscription,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        let result = match self.usecases.create_web_push_subscription(&web_push_subscription).await {
            Ok(_) => IsSuccess { is_success: 1},
            Err(e) => return Response::error(format!("Internal server error: {}", e), 500)
        };
        Response::from_json(&result)
    }

    pub async fn delete_web_push_subscription(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut web_push_subscription: WebPushSubscription = match from_str(json_body.as_str()) {
            Ok(web_push_subscription) => web_push_subscription,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        let result = match self.usecases.delete_web_push_subscription(&mut web_push_subscription).await {
            Ok(_) => IsSuccess { is_success: 1},
            Err(e) => return Response::error(format!("Internal server error: {}", e), 500)
        };
        Response::from_json(&result)
    }
}