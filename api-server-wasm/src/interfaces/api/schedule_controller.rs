use crate::application::usecases::schedule_usecases::ScheduleUsecases;
use crate::domain::entities::schedule::Schedules;
use crate::domain::repositories::schedule_repository::ScheduleRepository;
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
        let result = match self.usecases.get_schedules().await {
            Ok(schedules) => schedules,
            Err(e) => return Response::error(e.to_string(), 500) 
        };
        Response::from_json(&result)
    }

    pub async fn get_today_or_tomorrow_schedules(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let year = ctx.param("year").unwrap();
        let month = ctx.param("month").unwrap();
        let day = ctx.param("day").unwrap();

        let year_as_u16: u16 = year.parse().unwrap();
        let month_as_u8: u8 = month.parse().unwrap();
        let day_as_u8: u8 = day.parse().unwrap();

        let result = match self.usecases.get_today_or_tomorrow_schedules(year_as_u16, month_as_u8, day_as_u8).await {
            Ok(schedule) => schedule,
            Err(e) => return Response::error(e.to_string(), 500)
        };
        Response::from_json(&result)
    }

    pub async fn create_schedule(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let schedule: Schedules = match from_str(json_body.as_str()) {
            Ok(schedule) => schedule,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        self.usecases.create_schedule(&schedule).await?;
        Response::ok("A schedule was created")
    }

    pub async fn update_schedule(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut schedule: Schedules = match from_str(json_body.as_str()) {
            Ok(schedule) => schedule,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        self.usecases.update_schedule(&mut schedule).await?;
        Response::ok("A schedule was updated")
    }

    pub async fn delete_schedule(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut schedule: Schedules = match from_str(json_body.as_str()) {
            Ok(schedule) => schedule,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        self.usecases.delete_schedule(&mut schedule).await?;
        Response::ok("A schedule was deleted")
    }
}