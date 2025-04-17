use crate::application::usecases::web_push_subscription_usecases::WebPushSubscriptionUsecases;
use crate::domain::repositories::web_push_subscription_repository::WebPushSubscriptionRepository;
use crate::domain::entities::web_push_subscription::WebPushSubscription;
use crate::domain::entities::service::JSONResponse;
use worker::{Request, Response, Result, RouteContext};
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
        match self.usecases.get_web_push_subscriptions().await {
            Ok(web_push_subscription) => return Response::from_json(&web_push_subscription),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
    }

    pub async fn get_web_push_subscription_by_subscription_id(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let subscription_id = ctx.param("subscription_id").unwrap();
        match self.usecases.get_web_push_subscription_by_subscription_id(subscription_id).await {
            Ok(web_push_subscription) => return Response::from_json(&web_push_subscription),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
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
        match self.usecases.create_web_push_subscription(&web_push_subscription).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Web push subscription created successfully".to_string()
                };
                return Response::from_json(&success_response);
            },
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
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
        match self.usecases.delete_web_push_subscription(&mut web_push_subscription).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Web push subscription deleted successfully".to_string()
                };
                return Response::from_json(&success_response);
            },
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
    }
}
