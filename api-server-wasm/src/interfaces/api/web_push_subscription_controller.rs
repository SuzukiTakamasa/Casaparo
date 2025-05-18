use crate::application::usecases::web_push_subscription_usecases::WebPushSubscriptionUsecases;
use crate::domain::repositories::web_push_subscription_repository::WebPushSubscriptionRepository;
use crate::domain::entities::web_push_subscription::WebPushSubscription;
use super::*;

pub struct WebPushSubscriptionController<R: WebPushSubscriptionRepository> {
    usecases: WebPushSubscriptionUsecases<R>,
}

impl<R: WebPushSubscriptionRepository> WebPushSubscriptionController<R> {
    pub fn new(usecases: WebPushSubscriptionUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_web_push_subscriptions(&self) -> Result<Response> {
        match self.usecases.get_web_push_subscriptions().await {
            Ok(web_push_subscription) => return JSONResponse::new(Status::Ok, None, Some(web_push_subscription)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn get_web_push_subscription_by_subscription_id(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let subscription_id = ctx.param("subscription_id").unwrap();
        match self.usecases.get_web_push_subscription_by_subscription_id(subscription_id).await {
            Ok(web_push_subscription) => return JSONResponse::new(Status::Ok, None, Some(web_push_subscription)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn create_web_push_subscription(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let web_push_subscription: WebPushSubscription = match from_str(json_body.as_str()) {
            Ok(web_push_subscription) => web_push_subscription,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.create_web_push_subscription(&web_push_subscription).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Created, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn delete_web_push_subscription(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut web_push_subscription: WebPushSubscription = match from_str(json_body.as_str()) {
            Ok(web_push_subscription) => web_push_subscription,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.delete_web_push_subscription(&mut web_push_subscription).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }
}
