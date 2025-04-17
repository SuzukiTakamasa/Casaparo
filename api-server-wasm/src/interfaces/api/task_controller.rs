use crate::application::usecases::task_usecases::TaskUsecases;
use crate::domain::entities::task::Tasks;
use crate::domain::repositories::task_repository::TaskRepository;
use crate::domain::entities::service::JSONResponse;
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
        match self.usecases.get_tasks().await {
            Ok(tasks) => return Response::from_json(&tasks),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
    }

    pub async fn get_related_sub_tasks(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let id = ctx.param("id").unwrap();
        let id_as_u32: u32 = id.parse().unwrap();
        match self.usecases.get_related_sub_tasks(id_as_u32).await {
            Ok(tasks) => return Response::from_json(&tasks),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
    }

    pub async fn get_task_by_id(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let id = ctx.param("id").unwrap();
        let id_as_u32: u32 = id.parse().unwrap();
        match self.usecases.get_task_by_id(id_as_u32).await {
            Ok(task) => return Response::from_json(&task),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
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
        match self.usecases.create_task(&task).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Task created successfully".to_string()
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

    pub async fn update_task(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut task: Tasks = match from_str(json_body.as_str()) {
            Ok(task) => task,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.update_task(&mut task).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Task updated successfully".to_string()
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

    pub async fn delete_task(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut task: Tasks = match from_str(json_body.as_str()) {
            Ok(task) => task,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.delete_task(&mut task).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Task deleted successfully".to_string()
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
