use crate::application::usecases::task_comment_usecases::TaskCommentUsecases;
use crate::domain::entities::task::TaskComments;
use crate::domain::repositories::task_comment_repository::TaskCommentRepository;
use super::*;

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
            Ok(task_comment) => return JSONResponse::new(Status::Ok, None, Some(task_comment)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn create_task_comment(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let task_comment: TaskComments = match from_str(json_body.as_str()) {
            Ok(task_comment) => task_comment,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.create_task_comment(&task_comment).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Created, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn update_task_comment(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut task_comment: TaskComments = match from_str(json_body.as_str()) {
            Ok(task_comment) => task_comment,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.update_task_comment(&mut task_comment).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn delete_task_comment(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut task_comment: TaskComments = match from_str(json_body.as_str()) {
            Ok(task_comment) => task_comment,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.delete_task_comment(&mut task_comment).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)    
        };
    }
}
