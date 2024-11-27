use crate::application::usecases::task_usecases::TaskUsecases;
use crate::domain::entities::task::Tasks;
use crate::domain::repositories::task_repository::TaskRepository;
use crate::domain::entities::service::IsSuccess;
use worker::{Request, Response, Result, RouteContext};
use serde_json::from_str;
use crate::AppState;

pub struct TaskController<R: TaskRepository> {
    usecases: TaskUsecases<R>,
}

impl<R: TaskRepository> TaskController<R> {
    pub fn new(usecases: TaskUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_tasks(&self) -> Result<Response> {
        let result = match self.usecases.get_tasks().await {
            Ok(tasks) => tasks,
            Err(e) => return Response::error(e.to_string(), 500)
        };
        Response::from_json(&result)
    }

    pub async fn get_task_by_id(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let id = ctx.param("id").unwrap();
        let id_as_u32: u32 = id.parse().unwrap();
        let result = match self.usecases.get_task_by_id(id_as_u32).await {
            Ok(task) => task,
            Err(e) => return Response::error(e.to_string(), 500)
        };
        Response::from_json(&result)
    }

    pub async fn create_task(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let task: Tasks = match from_str(json_body.as_str()) {
            Ok(task) => task,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        let result = match self.usecases.create_task(&task).await {
            Ok(_) => IsSuccess { is_success: 1 },
            Err(e) => return Response::error(format!("Internal server error: {}", e), 500)
        };
        Response::from_json(&result)
    }

    pub async fn update_task(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut task: Tasks = match from_str(json_body.as_str()) {
            Ok(task) => task,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        let result = match self.usecases.update_task(&mut task).await {
            Ok(_) => IsSuccess { is_success: 1 },
            Err(e) => return Response::error(format!("Internal server error: {}", e), 500)
        };
        Response::from_json(&result)
    }

    pub async fn delete_task(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut task: Tasks = match from_str(json_body.as_str()) {
            Ok(task) => task,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        let result = match self.usecases.delete_task(&mut task).await {
            Ok(_) => IsSuccess { is_success: 1 },
            Err(e) => return Response::error(format!("Internal server error: {}", e), 500)
        };
        Response::from_json(&result)
    }
}