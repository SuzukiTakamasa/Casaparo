use crate::application::usecases::task_comment_usecases::TaskCommentUsecases;
use crate::domain::entities::task::TaskComments;
use crate::domain::repositories::task_comment_repository::TaskCommentRepository;
use crate::domain::entities::service::JSONResponse;
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
        match self.usecases.get_task_comments_by_task_id(task_id_as_u32).await {
            Ok(task_comment) => return Response::from_json(&task_comment),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
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
        match self.usecases.create_task_comment(&task_comment).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Task comment created successfully".to_string()
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

    pub async fn update_task_comment(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut task_comment: TaskComments = match from_str(json_body.as_str()) {
            Ok(task_comment) => task_comment,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.update_task_comment(&mut task_comment).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Task comment updated successfully".to_string()
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

    pub async fn delete_task_comment(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut task_comment: TaskComments = match from_str(json_body.as_str()) {
            Ok(task_comment) => task_comment,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.delete_task_comment(&mut task_comment).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Task comment deleted successfully".to_string()
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
