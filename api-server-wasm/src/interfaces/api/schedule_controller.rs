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
}