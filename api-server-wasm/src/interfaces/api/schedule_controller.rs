use crate::application::usecases::schedule_usecases::ScheduleUsecases;
use crate::domain::entities::schedule::Schedules;
use crate::domain::repositories::schedule_repository::ScheduleRepository;
use crate::domain::entities::service::{JSONResponse, Status};
use worker::{Request, Response, Result, RouteContext};
use serde_json::from_str;
use crate::AppState;

pub struct ScheduleController<R: ScheduleRepository> {
    usecases: ScheduleUsecases<R>,
}

impl<R: ScheduleRepository> ScheduleController<R> {
    pub fn new(usecases: ScheduleUsecases<R>) -> Self {
        Self { usecases }
    }


    pub async fn get_schedules(&self) -> Result<Response> {
        match self.usecases.get_schedules().await {
            Ok(schedules) => return JSONResponse::new(Status::Ok, None, Some(schedules)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn get_today_or_tomorrow_schedules(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let year = ctx.param("year").unwrap();
        let month = ctx.param("month").unwrap();
        let day = ctx.param("day").unwrap();

        let year_as_u16: u16 = year.parse().unwrap();
        let month_as_u8: u8 = month.parse().unwrap();
        let day_as_u8: u8 = day.parse().unwrap();

        match self.usecases.get_today_or_tomorrow_schedules(year_as_u16, month_as_u8, day_as_u8).await {
            Ok(schedule) => return JSONResponse::new(Status::Ok, None, Some(schedule)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn create_schedule(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let schedule: Schedules = match from_str(json_body.as_str()) {
            Ok(schedule) => schedule,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.create_schedule(&schedule).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Created, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn update_schedule(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut schedule: Schedules = match from_str(json_body.as_str()) {
            Ok(schedule) => schedule,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.update_schedule(&mut schedule).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn delete_schedule(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut schedule: Schedules = match from_str(json_body.as_str()) {
            Ok(schedule) => schedule,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.delete_schedule(&mut schedule).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }
}
