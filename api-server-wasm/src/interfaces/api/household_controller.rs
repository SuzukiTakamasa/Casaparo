use crate::application::usecases::household_usecases::HouseholdUsecases;
use crate::domain::entities::household::{Households, CompletedHouseholds};
use crate::domain::repositories::household_repository::HouseholdRepository;
use super::*;

pub struct HouseholdController<R: HouseholdRepository> {
    usecases: HouseholdUsecases<R>,
}

impl<R: HouseholdRepository> HouseholdController<R> {
    pub fn new(usecases: HouseholdUsecases<R>) -> Self {
        Self { usecases }
    }


    pub async fn get_households(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let year = ctx.param("year").unwrap();
        let month = ctx.param("month").unwrap();

        let year_as_u16: u16 = year.parse().unwrap();
        let month_as_u8: u8 = month.parse().unwrap();

        match self.usecases.get_households(year_as_u16, month_as_u8).await {
            Ok(household) => return JSONResponse::new(Status::Ok, None, Some(household)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn get_fixed_amount(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let year = ctx.param("year").unwrap();
        let month = ctx.param("month").unwrap();

        let year_as_u16: u16 = year.parse().unwrap();
        let month_as_u8: u8 = month.parse().unwrap();

        match self.usecases.get_fixed_amount(year_as_u16, month_as_u8).await {
            Ok(fixed_amount) => return JSONResponse::new(Status::Ok, None, Some(fixed_amount)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn get_completed_households(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let year = ctx.param("year").unwrap();
        let month = ctx.param("month").unwrap();

        let year_as_u16: u16 = year.parse().unwrap();
        let month_as_u8: u8 = month.parse().unwrap();

        match self.usecases.get_completed_households(year_as_u16, month_as_u8).await {
            Ok(is_completed) => return JSONResponse::new(Status::Ok, None, Some(is_completed)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn get_completed_households_monthly_summary(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let year = ctx.param("year").unwrap();

        let year_as_u16: u16 = year.parse().unwrap();

        match self.usecases.get_completed_households_monthly_summary(year_as_u16).await {
            Ok(household_monthly_summary) => return JSONResponse::new(Status::Ok, None, Some(household_monthly_summary)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn get_completed_households_monthly_summary_by_month(&self, ctx: &RouteContext<AppState>) -> Result<Response> {
        let year = ctx.param("year").unwrap();
        let month = ctx.param("month").unwrap();

        let year_as_u16: u16 = year.parse().unwrap();
        let month_as_u8: u8 = month.parse().unwrap();

        match self.usecases.get_completed_households_monthly_summary_by_month(year_as_u16, month_as_u8).await {
            Ok(household_monthly_summary) => return JSONResponse::new(Status::Ok, None, Some(household_monthly_summary)),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn create_household(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let household: Households = match from_str(json_body.as_str()) {
            Ok(household) => household,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.create_household(&household).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Created, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn update_household(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut household: Households = match from_str(json_body.as_str()) {
            Ok(household) => household,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.update_household(&mut household).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn delete_household(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let mut household: Households = match from_str(json_body.as_str()) {
            Ok(household) => household,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.delete_household(&mut household).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Ok, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }

    pub async fn create_completed_household(&self, req: &mut Request) -> Result<Response> {
        let json_body = match req.text().await {
            Ok(body) => body,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Bad request".to_string()), None)
        };
        let completed_household: CompletedHouseholds = match from_str(json_body.as_str()) {
            Ok(completed_household) => completed_household,
            Err(_) => return JSONResponse::<()>::new(Status::BadRequest, Some("Invalid request body".to_string()), None)
        };
        match self.usecases.create_completed_household(&completed_household).await {
            Ok(_) => return JSONResponse::<()>::new(Status::Created, None, None),
            Err(e) => return JSONResponse::<()>::new(Status::InternalServerError, Some(e.to_string()), None)
        };
    }
}
