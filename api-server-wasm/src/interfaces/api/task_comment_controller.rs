use crate::application::usecases::task_comment_usecases::TaskCommentUsecases;
use crate::domain::entities::task::TaskComments;
use crate::domain::repositories::task_comment_repository::TaskCommentRepository;
use crate::domain::entities::service::IsSuccess;
use worker::{Request, Response, Result, RouteContext};
use serde_json::from_str;
use crate::AppState;

pub struct TaskCommentController<R: TaskCommentRepository> {
    usecases: TaskCommentUsecases<R>,
}

impl<R: TaskCommentRepository> TaskCommentController<R> {
    pub fn new(usecases: TaskCommentUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_task_comments_by_task_id(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let task_id = ctx.param("task_id").unwrap();
        let task_id_as_u32: u32 = task_id.parse().unwrap();
        let result = match self.usecases.get_task_comments_by_task_id(task_id_as_u32).await {
            Ok(task_comment) => task_comment,
            Err(e) => return Response::error(e.to_string(), 500)
        };
        Response::from_json(&result)
    }

    pub async fn create_task_comment(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let task_comment: TaskComments = match from_str(json_body.as_str()) {
            Ok(task_comment) => task_comment,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        let result = match self.usecases.create_task_comment(&task_comment).await {
            Ok(_) => IsSuccess { is_success: 1 },
            Err(e) => return Response::error(format!("Internal server error: {}", e), 500)
        };
        Response::from_json(&result)
    }

    pub async fn update_task_comment(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut task_comment: TaskComments = match from_str(json_body.as_str()) {
            Ok(task_comment) => task_comment,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        let result = match self.usecases.update_task_comment(&mut task_comment).await {
            Ok(_) => IsSuccess { is_success: 1 },
            Err(e) => return Response::error(format!("Internal server error: {}", e), 500)
        };
        Response::from_json(&result)
    }

    pub async fn delete_task_comment(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut task_comment: TaskComments = match from_str(json_body.as_str()) {
            Ok(task_comment) => task_comment,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        let result = match self.usecases.delete_task_comment(&mut task_comment).await {
            Ok(_) => IsSuccess { is_success: 1 },
            Err(e) => return Response::error(format!("Internal server error: {}", e), 500)
        };
        Response::from_json(&result)
    }
}