use crate::application::usecases::schedule_usecases::ScheduleUsecases;
use crate::domain::entities::schedule::Schedules;
use crate::domain::repositories::schedule_repository::ScheduleRepository;
use crate::domain::entities::service::JSONResponse;
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
            Ok(schedules) => return Response::from_json(&schedules),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            } 
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
            Ok(schedule) => return Response::from_json(&schedule),
            Err(e) => {
                let error_response = JSONResponse {
                    status: 500,
                    message: format!("Internal server error: {}", e),
                };
                return Response::from_json(&error_response);
            }
        };
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
        match self.usecases.create_schedule(&schedule).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Schedule created successfully".to_string()
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

    pub async fn update_schedule(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut schedule: Schedules = match from_str(json_body.as_str()) {
            Ok(schedule) => schedule,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.update_schedule(&mut schedule).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Schedule updated successfully".to_string()
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

    pub async fn delete_schedule(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return Response::error("Bad request", 400)
        };
        let mut schedule: Schedules = match from_str(json_body.as_str()) {
            Ok(schedule) => schedule,
            Err(_) => return Response::error("Invalid request body", 400)
        };
        match self.usecases.delete_schedule(&mut schedule).await {
            Ok(_) => {
                let success_response = JSONResponse {
                    status: 200,
                    message: "Schedule deleted successfully".to_string()
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
