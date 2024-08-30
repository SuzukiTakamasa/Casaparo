use worker::*;
use serde_json::from_str;
use std::sync::Arc;

mod entities;
mod application;
mod domain;
mod infrastructure;
mod interfaces;

use crate::infrastructure::repositories::d1_household_repository::D1HouseholdRepository;
use crate::application::usecases::household_usecases::HouseholdUsecases;
use crate::interfaces::api::household_controller::HouseholdController;

use crate::infrastructure::repositories::d1_schedule_repository::D1ScheduleRepository;
use crate::application::usecases::schedule_usecases::ScheduleUsecases;
use crate::interfaces::api::schedule_controller::ScheduleController;

use crate::infrastructure::repositories::d1_wiki_repository::D1WikiRepository;
use crate::application::usecases::wiki_usecases::WikiUsecases;
use crate::interfaces::api::wiki_controller::WikiController;

use crate::infrastructure::repositories::d1_label_repository::D1LabelRepository;
use crate::application::usecases::label_usecases::LabelUsecases;
use crate::interfaces::api::label_controller::LabelController;

use crate::infrastructure::repositories::d1_anniversary_repository::D1AnniversaryRepository;
use crate::application::usecases::anniversary_usecases::AnniversaryUsecases;
use crate::interfaces::api::anniversary_controller::AnniversaryController;


fn get_db_env(req: &Request) -> Result<String> {
    let header_name = "Environment"; 
    match req.headers().get(header_name)? {
        Some(value) => Ok(value),
        None => Err(worker::Error::RustError(format!("Failed to get {} value", header_name))),
    }
}

pub struct AppState {
    household_controller: HouseholdController<D1HouseholdRepository>,
    schedule_controller: ScheduleController<D1ScheduleRepository>,
    wiki_controller: WikiController<D1WikiRepository>,
    label_controller: LabelController<D1LabelRepository>,
    anniversary_controller: AnniversaryController<D1AnniversaryRepository>,
}

#[event(fetch, respond_with_errors)]
async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {

    /*let allowed_origins = vec![
        env.var("CORS_FRONTEND_HOST_DEV")?.to_string(),
        env.var("CORS_FRONTEND_HOST_PROD_DEFAULT")?.to_string(),
        env.var("CORS_FRONTEND_HOST_PROD_LINE_BOT")?.to_string(),
    ];
    let allowed_origins_str = allowed_origins.join("\0");*/

    let mut headers = Headers::new();
    headers.set("Access-Control-Allow-Origin", "*")?;
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")?;
    headers.set("Access-Control-Allow-Headers", "*")?;
    headers.set("Access-Control-Max-Age", "86400")?;

    if req.method() == Method::Options {
        return Response::empty()
            .map(|resp| resp.with_headers(headers))
    }

    let db_str = get_db_env(&req)?;
    let db = Arc::new(env.d1(db_str.as_str())?);

    let household_repository = D1HouseholdRepository::new(db.clone());
    let household_usecases = HouseholdUsecases::new(household_repository);
    let household_controller = HouseholdController::new(household_usecases);

    let schedule_repository = D1ScheduleRepository::new(db.clone());
    let schedule_usecases = ScheduleUsecases::new(schedule_repository);
    let schedule_controller = ScheduleController::new(schedule_usecases);

    let wiki_repository = D1WikiRepository::new(db.clone());
    let wiki_usecases = WikiUsecases::new(wiki_repository);
    let wiki_controller = WikiController::new(wiki_usecases);

    let label_repository = D1LabelRepository::new(db.clone());
    let label_usecases = LabelUsecases::new(label_repository);
    let label_controller = LabelController::new(label_usecases);

    let anniversary_repository = D1AnniversaryRepository::new(db);
    let anniversary_usecases = AnniversaryUsecases::new(anniversary_repository);
    let anniversary_controller = AnniversaryController::new(anniversary_usecases);

    let app_state = AppState {
        household_controller,
        schedule_controller,
        wiki_controller,
        label_controller,
        anniversary_controller,
    };


    Router::with_data(app_state)
    //v2
        .get_async("/v2/household/:year/:month", |_req, ctx| async move {
            ctx.data.household_controller.get_households(&ctx).await
        })
        .get_async("/v2/household/fixed_amount/:year/:month", |_req, ctx| async move {
            ctx.data.household_controller.get_fixed_amount(&ctx).await
        })
        .get_async("/v2/completed_household/:year/:month", |_req, ctx| async move {
            ctx.data.household_controller.get_completed_households(&ctx).await
        })
        .get_async("/v2/completed_household/monthly_summary/:year", |_req, ctx| async move {
            ctx.data.household_controller.get_completed_households_monthly_summary(&ctx).await
        })
        .post_async("/v2/household/create", |mut req, ctx| async move {
            ctx.data.household_controller.create_household(&mut req).await
        })
        .post_async("/v2/household/update", |mut req, ctx| async move {
            ctx.data.household_controller.update_household(&mut req).await
        })
        .post_async("/v2/household/delete", |mut req, ctx| async move {
            ctx.data.household_controller.delete_household(&mut req).await
        })
        .post_async("/v2/completed_household/create", |mut req, ctx| async move {
            ctx.data.household_controller.create_completed_household(&mut req).await
        })
     //schedule
        .get_async("/v2/schedule", |_req, ctx| async move {
            ctx.data.schedule_controller.get_schedules().await
        })
        .get_async("/v2/schedule/today_or_tomorrow/:year/:month/:day", |_req, ctx| async move {
            ctx.data.schedule_controller.get_today_or_tomorrow_schedules(&ctx).await
        })
        .post_async("/v2/schedule/create", |mut req, ctx| async move {
            ctx.data.schedule_controller.create_schedule(&mut req).await
        })
        .post_async("/v2/schedule/update", |mut req, ctx| async move {
            ctx.data.schedule_controller.update_schedule(&mut req).await
        })
        .post_async("/v2/schedule/delete", |mut req, ctx| async move {
            ctx.data.schedule_controller.delete_schedule(&mut req).await
        })
     //wiki
        .get_async("/v2/wiki", |_req, ctx| async move {
            ctx.data.wiki_controller.get_wikis().await
        })
        .get_async("/v2/wiki/:id", |_req, ctx| async move {
            ctx.data.wiki_controller.get_wikis_by_id(&ctx).await
        })
        .post_async("/v2/wiki/create", |mut req, ctx| async move {
            ctx.data.wiki_controller.create_wiki(&mut req).await
        })
        .post_async("/v2/wiki/update", |mut req, ctx| async move {
            ctx.data.wiki_controller.update_wiki(&mut req).await
        })
        .post_async("/v2/wiki/delete", |mut req, ctx| async move {
            ctx.data.wiki_controller.delete_wiki(&mut req).await
        })
     //label
        .get_async("/v2/label", |_req, ctx| async move {
            ctx.data.label_controller.get_labels().await
        })
        .get_async("/v2/label/is_used_for_schedule/:id", |_req, ctx| async move {
            ctx.data.label_controller.is_used_for_schedule(&ctx).await
        })
        .post_async("/v2/label/create", |mut req, ctx| async move {
            ctx.data.label_controller.create_label(&mut req).await
        })
        .post_async("/v2/label/update", |mut req, ctx| async move {
            ctx.data.label_controller.update_label(&mut req).await
        })
        .post_async("/v2/label/delete", |mut req, ctx| async move {
            ctx.data.label_controller.delete_label(&mut req).await
        })
     //anniversary
        .get_async("/v2/anniversary", |_req, ctx| async move {
            ctx.data.anniversary_controller.get_anniversaries().await
        })
        .post_async("/v2/anniversary/create", |mut req, ctx| async move {
            ctx.data.anniversary_controller.create_anniversary(&mut req).await
        })
        .post_async("/v2/anniversary/update", |mut req, ctx| async move {
            ctx.data.anniversary_controller.update_anniversary(&mut req).await
        })
        .post_async("/v2/anniversary/delete", |mut req, ctx| async move {
            ctx.data.anniversary_controller.delete_anniversary(&mut req).await
        })
    //v1
        .get_async("/household/:year/:month", |req, ctx| async move {
            let year = ctx.param("year").unwrap();
            let month = ctx.param("month").unwrap();
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            
            let d1 = ctx.env.d1(db_str.as_str())?;
            let statement = d1.prepare("select * from households where ( year = ?1 and month = ?2 ) or is_default = 1 order by is_default desc");
            let query = statement.bind(&[year.into(), month.into()])?;
            let result = match query.all().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            match result.results::<entities::Households>() {
                Ok(households) => Response::from_json(&households),
                Err(e) => {
                    console_log!("{:?}", e);
                    Response::error("Error parsing results", 500)
                }
            }
        })
        .get_async("/household/fixed_amount/:year/:month", |req, ctx| async move {
            let year = ctx.param("year").unwrap();
            let month = ctx.param("month").unwrap();
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let statement = d1.prepare("select sum(case when is_owner = 1 then amount else -amount end) as billing_amount, sum(amount) as total_amount from households where ( year = ?1 and month = ?2 ) or is_default = 1");
            let query = statement.bind(&[year.into(), month.into()])?;
            match query.first::<entities::FixedAmount>(None).await {
                Ok(fixed_amount) => Response::from_json(&fixed_amount),
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Error parsing results", 500)
                }
            }
        })
        .get_async("/completed_household/:year/:month", |req, ctx| async move {
            let year = ctx.param("year").unwrap();
            let month = ctx.param("month").unwrap();
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let statement = d1.prepare("select case when exists (select * from completed_households where year = ?1 and month = ?2) then 1 else 0 end as is_completed");
            let query = statement.bind(&[year.into(), month.into()])?;
            match query.first::<entities::IsCompleted>(None).await {
                Ok(is_completed) => Response::from_json(&is_completed),
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Error parsing results", 500)
                }
            }
        })
        .get_async("/completed_household/monthly_summary/:year", |req, ctx| async move {
            let year = ctx.param("year").unwrap();
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let statement = d1.prepare("select month, billing_amount, total_amount from completed_households where year = ?1");
            let query = statement.bind(&[year.into()])?;
            let result = match query.all().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Error parsing results", 500)
                }
            };
            match result.results::<entities::HouseholdMonthlySummary>() {
                Ok(monthly_summary) => Response::from_json(&monthly_summary),
                Err(e) => {
                    console_log!("{:?}", e);
                    Response::error("Error parsing results", 500)
                }
            }
        })
        .get_async("/schedule", |req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            
            let d1 = ctx.env.d1(db_str.as_str())?;
            let query = d1.prepare("select * from (select schedules.*, case when label_id = 0 then null else labels.label end as label from schedules left join labels on schedules.label_id = labels.id) as schedules");
            let result = match query.all().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            match result.results::<entities::Schedules>() {
                Ok(schedules) => Response::from_json(&schedules),
                Err(e) => {
                    console_log!("{:?}", e);
                    Response::error("Error parsing results", 500) 
                }
            }
        })
        .get_async("/schedule/today_or_tomorrow/:year/:month/:day", |req, ctx| async move {
            let year = ctx.param("year").unwrap();
            let month = ctx.param("month").unwrap();
            let day = ctx.param("day").unwrap();
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            
            let d1 = ctx.env.d1(db_str.as_str())?;
            let statement = d1.prepare("select * from (select schedules.*, case when label_id = 0 then null else labels.label end as label from schedules left join labels on schedules.label_id = labels.id where from_year = ?1 and from_month = ?2 and (from_date = ?3 or from_date = ?3 + 1)) as schedules");
            let query = statement.bind(&[year.into(),
                                                              month.into(),
                                                              day.into()])?;
            let result = match query.all().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            match result.results::<entities::Schedules>() {
                Ok(schedules) => Response::from_json(&schedules),
                Err(e) => {
                    console_log!("{:?}", e);
                    Response::error("Error parsing results", 500) 
                }
            }
        })
        .get_async("/wiki", |req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let d1 = ctx.env.d1(db_str.as_str())?;
            let query = d1.prepare("select * from wikis order by id desc");
            let result = match query.all().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            match result.results::<entities::Wikis>() {
                Ok(wikis) => Response::from_json(&wikis),
                Err(e) => {
                    console_log!("{:?}", e);
                    Response::error("Error parsing results", 500)
                }
            }
        })
        .get_async("/wiki/:id", |req, ctx| async move {
            let id = ctx.param("id").unwrap();
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let statement = d1.prepare("select * from wikis where id = ?1");
            let query = statement.bind(&[id.into()])?;
            match query.first::<entities::Wikis>(None).await {
                Ok(wiki_detail) => Response::from_json(&wiki_detail),
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Error parsing results", 500)
                }
            }
        })
        .get_async("/label", |req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let query = d1.prepare("select * from labels order by id desc");
            let result = match query.all().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            match result.results::<entities::Labels>() {
                Ok(labels) => Response::from_json(&labels),
                Err(e) => {
                    console_log!("{:?}", e);
                    Response::error("Error parsing results", 500)
                }
            }
        })
        .get_async("/anniversary", |req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let query= d1.prepare("select * from anniversaries");
            let result = match query.all().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            match result.results::<entities::Anniversaries>() {
                Ok(anniversaries) => Response::from_json(&anniversaries),
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Error parsing results", 500)
                }
            }
        })
        .post_async("/household/create", |mut req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let json_body = match req.text().await {
                Ok(body) => body,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Bad request", 400)
                }
            };
            let household: entities::Households = match from_str(json_body.as_str()) {
                Ok(household) => household,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let statement = d1.prepare("insert into households (name, amount, year, month, is_default, is_owner, version) values (?1, ?2, ?3, ?4, ?5, ?6, ?7)");
            let query = statement.bind(&[household.name.into(),
                                                              household.amount.into(),
                                                              household.year.into(),
                                                              household.month.into(),
                                                              household.is_default.into(),
                                                              household.is_owner.into(),
                                                              household.version.into()])?;
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            Response::ok("A household was created.")
        })
        .post_async("/household/update", |mut req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let json_body = match req.text().await {
                Ok(body) => body,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Bad request", 400)
                }
            };
            let mut household: entities::Households = match from_str(json_body.as_str()) {
                Ok(household) => household,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let fetch_version_statement = d1.prepare("select version from households where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[household.id.into()])?;
            let fetch_version_result = match fetch_version_query.first::<entities::LatestVersion>(None).await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Failed to fetch version", 500)
                }
            };
            if let Some(latest) = fetch_version_result {
                if household.version == latest.version {
                    household.version += 1;
                } else {
                    return Response::error("Attempt to update a stale object", 500)
                }
            } else {
                return Response::error("Version is found None", 500)
            }
            let statement = d1.prepare("update households set name = ?1, amount = ?2, is_default = ?3, is_owner = ?4, version = ?5 where id = ?6");
            let query = statement.bind(&[household.name.into(),
                                                              household.amount.into(),
                                                              household.is_default.into(),
                                                              household.is_owner.into(),
                                                              household.version.into(),
                                                              household.id.into()])?;
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            Response::ok("A household was updated.")
        })
        .post_async("/household/delete", |mut req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let json_body = match req.text().await {
                Ok(body) => body,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Bad request", 400)
                }
            };
            let mut household: entities::Households = match from_str(json_body.as_str()) {
                Ok(household) => household,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let fetch_version_statement = d1.prepare("select version from households where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[household.id.into()])?;
            let fetch_version_result = match fetch_version_query.first::<entities::LatestVersion>(None).await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Failed to fetch version", 500)
                }
            };
            if let Some(latest) = fetch_version_result {
                if household.version == latest.version {
                    household.version += 1;
                } else {
                    return Response::error("Attempt to update a stale object", 500)
                }
            } else {
                return Response::error("Version is found None", 500)
            }
            let statement = d1.prepare("delete from households where id = ?1");
            let query = statement.bind(&[household.id.into()])?;
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            Response::ok("A household was deleted.")
        })
        .post_async("/schedule/create", |mut req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let json_body = match req.text().await {
                Ok(body) => body,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Bad request", 400)
                }
            };
            let schedule: entities::Schedules = match from_str(json_body.as_str()) {
                Ok(schedule) => schedule,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let statement = d1.prepare("insert into schedules (description, from_year, to_year, from_month, to_month, from_date, to_date, from_time, to_time, created_by, label_id, version) values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)");
            let query = statement.bind(&[schedule.description.into(),
                                                              schedule.from_year.into(),
                                                              schedule.to_year.into(),
                                                              schedule.from_month.into(),
                                                              schedule.to_month.into(),
                                                              schedule.from_date.into(),
                                                              schedule.to_date.into(),
                                                              schedule.from_time.into(),
                                                              schedule.to_time.into(),
                                                              schedule.created_by.into(),
                                                              schedule.label_id.into(),
                                                              schedule.version.into()])?;
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            Response::ok("A schedule was created.")
        })
        .post_async("/schedule/update", |mut req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let json_body = match req.text().await {
                Ok(body) => body,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Bad request", 400)
                }
            };
            let mut schedule: entities::Schedules = match from_str(json_body.as_str()) {
                Ok(schedule) => schedule,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let fetch_version_statement = d1.prepare("select version from schedules where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[schedule.id.into()])?;
            let fetch_version_result = match fetch_version_query.first::<entities::LatestVersion>(None).await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Failed to fetch version", 500)
                }
            };
            if let Some(latest) = fetch_version_result {
                if schedule.version == latest.version {
                    schedule.version += 1
                } else {
                    return Response::error("Attempt to update a stale object", 500);
                }
            } else {
                return Response::error("Version is found None", 500);
            }
            let statement = d1.prepare("update schedules set description = ?1, from_year = ?2, to_year = ?3, from_month = ?4, to_month = ?5, from_date = ?6, to_date = ?7, from_time = ?8, to_time = ?9, created_by = ?10, label_id = ?11, version = ?12 where id = ?13");
            let query = statement.bind(&[schedule.description.into(),
                                                              schedule.from_year.into(),
                                                              schedule.to_year.into(),
                                                              schedule.from_month.into(),
                                                              schedule.to_month.into(),
                                                              schedule.from_date.into(),
                                                              schedule.to_date.into(),
                                                              schedule.from_time.into(),
                                                              schedule.to_time.into(),
                                                              schedule.created_by.into(),
                                                              schedule.label_id.into(),
                                                              schedule.version.into(),
                                                              schedule.id.into()])?;
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            Response::ok("A schedule was updated.")
        })
        .post_async("/schedule/delete", |mut req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let json_body = match req.text().await {
                Ok(body) => body,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Bad request", 400)
                }
            };
            let mut schedule: entities::Schedules = match from_str(json_body.as_str()) {
                Ok(schedule) => schedule,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let fetch_version_statement = d1.prepare("select version from schedules where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[schedule.id.into()])?;
            let fetch_version_result = match fetch_version_query.first::<entities::LatestVersion>(None).await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Failed to fetch version", 500)
                }
            };
            if let Some(latest) = fetch_version_result {
                if schedule.version == latest.version {
                    schedule.version += 1
                } else {
                    return Response::error("Attempt tp update a stale object", 500);
                }
            } else {
                return Response::error("Version is found None", 500);
            }
            let statement = d1.prepare("delete from schedules where id = ?1");
            let query = statement.bind(&[schedule.id.into()])?;
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            Response::ok("A schedule was deleted.")
        })
        .post_async("/completed_household/create", |mut req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let json_body = match req.text().await {
                Ok(body) => body,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Bad request", 400)
                }
            };
            let completed_household: entities::CompletedHouseholds = match from_str(json_body.as_str()) {
                Ok(completed_household) => completed_household,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let statement = d1.prepare("insert into completed_households (year, month, detail, billing_amount, total_amount) values (?1, ?2, ?3, ?4, ?5)");
            let query = statement.bind(&[completed_household.year.into(),
                                                              completed_household.month.into(),
                                                              completed_household.detail.into(),
                                                              completed_household.billing_amount.into(),
                                                              completed_household.total_amount.into()
                                                              ])?;
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            return Response::ok("A completed household was created.")
        })
        .post_async("/wiki/create", |mut req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let json_body = match req.text().await {
                Ok(body) => body,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Bad request", 400)
                }
            };
            let wiki: entities::Wikis = match from_str(json_body.as_str()) {
                Ok(wiki) => wiki,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let statement = d1.prepare("insert into wikis (title, content, created_by, updated_at, image_url, version) values (?1, ?2, ?3, ?4, ?5, ?6)");
            let query = statement.bind(&[wiki.title.into(),
                                                              wiki.content.into(),
                                                              wiki.created_by.into(),
                                                              wiki.updated_at.into(),
                                                              wiki.image_url.into(),
                                                              wiki.version.into()])?;
            
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            return Response::ok("A wiki was created.")
        })
        .post_async("/wiki/update", |mut req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let json_body = match req.text().await {
                Ok(body) => body,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Bad request", 400)
                } 
            };
            let mut wiki: entities::Wikis = match from_str(json_body.as_str()) {
                Ok(wiki) => wiki,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let fetch_version_statement = d1.prepare("select version from wikis where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[wiki.id.into()])?;
            let fetch_version_result = match fetch_version_query.first::<entities::LatestVersion>(None).await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Failed to fetch version", 500)
                }
            };
            if let Some(latest) = fetch_version_result {
                if wiki.version == latest.version {
                    wiki.version += 1
                } else {
                    return Response::error("Attempt to update a stale object", 500)
                }
            } else {
                return Response::error("Version is found None", 500)
            }
            let statement = d1.prepare("update wikis set title = ?1, content = ?2, created_by = ?3, updated_at = ?4, image_url = ?5, version = ?6 where id = ?7");
            let query = statement.bind(&[wiki.title.into(),
                                                              wiki.content.into(),
                                                              wiki.created_by.into(),
                                                              wiki.updated_at.into(),
                                                              wiki.image_url.into(),
                                                              wiki.version.into(),
                                                              wiki.id.into()])?;
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            Response::ok("A wiki was updated.")
        })
        .post_async("/wiki/delete", |mut req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let json_body = match req.text().await {
                Ok(body) => body,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Bad request", 400)
                } 
            };
            let mut wiki: entities::Wikis = match from_str(json_body.as_str()) {
                Ok(wiki) => wiki,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let fetch_version_statement = d1.prepare("select version from wikis where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[wiki.id.into()])?;
            let fetch_version_result = match fetch_version_query.first::<entities::LatestVersion>(None).await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Failed to fetch version", 500)
                }
            };
            if let Some(latest) = fetch_version_result {
                if wiki.version == latest.version {
                    wiki.version += 1
                } else {
                    return Response::error("Attempt to update a stale object", 500)
                }
            } else {
                return Response::error("Version is found None", 500)
            }
            let statement = d1.prepare("delete from wikis where id = ?1");
            let query = statement.bind(&[wiki.id.into()])?;
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            Response::ok("A wiki was deleted.")
        })
        .post_async("/label/create", |mut req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let json_body = match req.text().await {
                Ok(body) => body,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Bad request", 400)
                }
            };
            let label: entities::Labels = match from_str(json_body.as_str()) {
                Ok(label) => label,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let statement = d1.prepare("insert into labels (name, label, version) values (?1, ?2, ?3)");
            let query = statement.bind(&[label.name.into(),
                                                              label.label.into(),
                                                              label.version.into()])?;
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            Response::ok("A label was created.")
        })
        .post_async("/label/update", |mut req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let json_body = match req.text().await {
                Ok(body) => body,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Bad request", 400)
                }
            };
            let mut label: entities::Labels = match from_str(json_body.as_str()) {
                Ok(label) => label,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let fetch_version_statement = d1.prepare("select version from labels where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[label.id.into()])?;
            let fetch_version_result = match fetch_version_query.first::<entities::LatestVersion>(None).await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Failed to fetch version", 500)
                }
            };
            if let Some(latest) = fetch_version_result {
                if label.version == latest.version {
                    label.version += 1
                } else {
                    return Response::error("Attempt to update a stale object", 500)
                }
            } else {
                return Response::error("Version is found None", 500)
            }
            let statement = d1.prepare("update labels set name = ?1, label = ?2, version = ?3 where id = ?4");
            let query = statement.bind(&[label.name.into(),
                                                              label.label.into(),
                                                              label.version.into(),
                                                              label.id.into()])?;
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            Response::ok("A label was updated.")
        })
        .post_async("/label/delete", |mut req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let json_body = match req.text().await {
                Ok(body) => body,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Bad request", 400)
                }
            };
            let mut label: entities::Labels = match from_str(json_body.as_str()) {
                Ok(label) => label,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let fetch_version_statement = d1.prepare("select version from labels where id  = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[label.id.into()])?;
            let fetch_version_result = match fetch_version_query.first::<entities::LatestVersion>(None).await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Failed to fetch version", 500)
                }
            };
            if let Some(latest) = fetch_version_result {
                if label.version == latest.version {
                    label.version += 1
                } else {
                    return Response::error("Attempt to update a stale object", 500)
                }
            } else {
                return Response::error("Version is found None", 500)
            }
            let statement = d1.prepare("delete from labels where id = ?1");
            let query = statement.bind(&[label.id.into()])?;
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            Response::ok("A label was deleted")
        })
         .post_async("/anniversary/create", |mut req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let json_body = match req.text().await {
                Ok(body) => body,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Bad request", 400)
                }
            };

            let anniversary: entities::Anniversaries = match from_str(json_body.as_str()) {
                Ok(anniversary) => anniversary,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let statement = d1.prepare("insert into anniversaries (month, date, description, version) values (?1, ?2, ?3, ?4)");
            let query = statement.bind(&[anniversary.month.into(),
                                                              anniversary.date.into(),
                                                              anniversary.description.into(),
                                                              anniversary.version.into()])?;
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            return Response::ok("An anniversary was created")
         })
         .post_async("/anniversary/update", |mut req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let json_body = match req.text().await {
                Ok(body) => body,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Bad request", 400)
                } 
            };

            let mut anniversary: entities::Anniversaries = match from_str(json_body.as_str()) {
                Ok(anniversary) => anniversary,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let fetch_version_statement = d1.prepare("select version from anniversaries where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[anniversary.id.into()])?;
            let fetch_version_result = match fetch_version_query.first::<entities::LatestVersion>(None).await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Failed to fetch version", 500)
                }
            };
            if let Some(latest) = fetch_version_result {
                if anniversary.version == latest.version {
                    anniversary.version += 1
                } else {
                    return Response::error("Attempt to update a stale object", 500)
                }
            } else {
                return Response::error("Version is found None", 500)
            }
            let statement = d1.prepare("update anniversaries set month = ?1, date = ?2, description = ?3, version = ?4 where id = ?5");
            let query = statement.bind(&[anniversary.month.into(),
                                                              anniversary.date.into(),
                                                              anniversary.description.into(),
                                                              anniversary.version.into(),
                                                              anniversary.id.into()])?;
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            Response::ok("An annivetsary was updated.")
         })
         .post_async("/anniversary/delete", |mut req, ctx| async move {
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            let json_body = match req.text().await {
                Ok(body) => body,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Bad request", 400)
                } 
            };

            let mut anniversary: entities::Anniversaries = match from_str(json_body.as_str()) {
                Ok(anniversary) => anniversary,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let fetch_version_statement = d1.prepare("select version from anniversaries where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[anniversary.id.into()])?;
            let fetch_version_result = match fetch_version_query.first::<entities::LatestVersion>(None).await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Failed to fetch version", 500)
                }
            };
            if let Some(latest) = fetch_version_result {
                if anniversary.version == latest.version {
                    anniversary.version += 1
                } else {
                    return Response::error("Attempt to update a stale object", 500)
                }
            } else {
                return Response::error("Version is found None", 500)
            }
            let statement = d1.prepare("delete from anniversaries where id = ?1");
            let query = statement.bind(&[anniversary.id.into()])?;
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            Response::ok("An anniversary was deleted.")
         })
    .run(req, env)
    .await
    .map(|resp| resp.with_headers(headers))
}
