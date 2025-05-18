use crate::application::usecases::task_usecases::TaskUsecases;
use crate::domain::entities::task::Tasks;
use crate::domain::repositories::task_repository::TaskRepository;
use super::*;

pub struct TaskController<R: TaskRepository> {
    usecases: TaskUsecases<R>,
}

impl<R: TaskRepository> TaskController<R> {
    pub fn new(usecases: TaskUsecases<R>) -> Self {
        Self { usecases }
    }

    pub async fn get_tasks(&self) -> Result<Response> {
        match self.usecases.get_tasks().await {
            Ok(tasks) => return JSONResponse::new(Status::Ok, None, Some(tasks)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn get_related_sub_tasks(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let id = ctx.param("id").unwrap();
        let id_as_u32: u32 = id.parse().unwrap();
        match self.usecases.get_related_sub_tasks(id_as_u32).await {
            Ok(tasks) => return JSONResponse::new(Status::Ok, None, Some(tasks)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn get_task_by_id(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let id = ctx.param("id").unwrap();
        let id_as_u32: u32 = id.parse().unwrap();
        match self.usecases.get_task_by_id(id_as_u32).await {
            Ok(task) => return JSONResponse::new(Status::Ok, None, Some(task)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn create_task(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let task: Tasks = match from_str(json_body.as_str()) {
            Ok(task) => task,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.create_task(&task).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Created, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn update_task(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut task: Tasks = match from_str(json_body.as_str()) {
            Ok(task) => task,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.update_task(&mut task).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn delete_task(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut task: Tasks = match from_str(json_body.as_str()) {
            Ok(task) => task,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.delete_task(&mut task).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }
}
