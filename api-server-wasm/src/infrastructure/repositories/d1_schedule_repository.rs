use crate::domain::entities::schedule::Schedules;
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::schedule_repository::ScheduleRepository;
use crate::async_trait::async_trait;
use worker::{D1Database, Result};
use std::sync::Arc;

pub struct D1ScheduleRepository {
    db: Arc<D1Database>,
}

impl D1ScheduleRepository {
    pub fn new(db: Arc<D1Database>) -> Self {
        Self {db: db}
    }
}