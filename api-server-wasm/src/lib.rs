use worker::*;
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
     //hosuehold
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
        .get_async("/v2/completed_household/monthly_summary/:year/:month", |_req, ctx| async move {
            ctx.data.household_controller.get_completed_households_monthly_summary_by_month(&ctx).await
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
    .run(req, env)
    .await
    .map(|resp| resp.with_headers(headers))
}
