use worker::*;
use std::sync::Arc;

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

use crate::infrastructure::repositories::d1_wiki_image_repository::D1WikiImageRepository;
use crate::application::usecases::wiki_image_usecases::WikiImageUsecases;
use crate::interfaces::api::wiki_image_controller::WikiImageController;

use crate::infrastructure::repositories::d1_label_repository::D1LabelRepository;
use crate::application::usecases::label_usecases::LabelUsecases;
use crate::interfaces::api::label_controller::LabelController;

use crate::infrastructure::repositories::d1_anniversary_repository::D1AnniversaryRepository;
use crate::application::usecases::anniversary_usecases::AnniversaryUsecases;
use crate::interfaces::api::anniversary_controller::AnniversaryController;

use crate::infrastructure::repositories::d1_inventory_repository::D1InventoryRepository;
use crate::application::usecases::inventory_usecases::InventoryUsecases;
use crate::interfaces::api::inventory_controller::InventoryController;

use crate::infrastructure::repositories::d1_shopping_note_repository::D1ShoppingNoteRepository;
use crate::application::usecases::shopping_note_usecases::ShoppingNoteUsecases;
use crate::interfaces::api::shopping_note_controller::ShoppingNoteController;

use crate::infrastructure::repositories::d1_inventory_type_repository::D1InventoryTypeRepository;
use crate::application::usecases::inventory_type_usecases::InventoryTypeUsecases;
use crate::interfaces::api::inventory_type_controller::InventoryTypeController;

use crate::infrastructure::repositories::d1_task_repository::D1TaskRepository;
use crate::application::usecases::task_usecases::TaskUsecases;
use crate::interfaces::api::task_controller::TaskController;

use crate::infrastructure::repositories::d1_task_comment_repository::D1TaskCommentRepository;
use crate::application::usecases::task_comment_usecases::TaskCommentUsecases;
use crate::interfaces::api::task_comment_controller::TaskCommentController;

use crate::infrastructure::repositories::d1_web_push_subscription_repository::D1WebPushSubscriptionRepository;
use crate::application::usecases::web_push_subscription_usecases::WebPushSubscriptionUsecases;
use crate::interfaces::api::web_push_subscription_controller::WebPushSubscriptionController;


pub struct AppState {
    household_controller: HouseholdController<D1HouseholdRepository>,
    schedule_controller: ScheduleController<D1ScheduleRepository>,
    wiki_controller: WikiController<D1WikiRepository>,
    wiki_image_controller: WikiImageController<D1WikiImageRepository>,
    label_controller: LabelController<D1LabelRepository>,
    anniversary_controller: AnniversaryController<D1AnniversaryRepository>,
    inventory_controller: InventoryController<D1InventoryRepository>,
    shopping_note_controller: ShoppingNoteController<D1ShoppingNoteRepository>,
    inventory_type_controller: InventoryTypeController<D1InventoryTypeRepository>,
    task_controller: TaskController<D1TaskRepository>,
    task_comment_controller: TaskCommentController<D1TaskCommentRepository>,
    web_push_subscription_controller: WebPushSubscriptionController<D1WebPushSubscriptionRepository>,
}

#[event(fetch, respond_with_errors)]
async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {

    let db_str = env.secret("D1_DATABASE_BINDING")?.to_string();

    let mut allowed_origins = vec![
        env.secret("CORS_FRONTEND_HOST")?.to_string(),
        env.secret("CORS_LINE_BOT_SERVER_HOST")?.to_string(),
        env.secret("CORS_R2_HOST")?.to_string(),
        env.secret("CORS_WEB_PUSH_HOST")?.to_string()
    ];
    
    if db_str == "DB-DEV" {
        allowed_origins.push(env.secret("CORS_LOCALHOST")?.to_string())
    }

    let mut headers = Headers::new();

    let origin = req.headers().get("Origin")?.unwrap_or_default();
    if allowed_origins.contains(&origin) {
        headers.set("Access-Control-Allow-Origin", &origin)?;
    } else {
        return Response::error(format!("Invalid origin: {}", origin), 403);
    }
    
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")?;
    headers.set("Access-Control-Allow-Headers", "*")?;
    headers.set("Access-Control-Max-Age", "86400")?;

    if req.method() == Method::Options {
        return Response::empty()
            .map(|resp| resp.with_headers(headers))
    }

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

    let wiki_image_repository = D1WikiImageRepository::new(db.clone());
    let wiki_image_usecases = WikiImageUsecases::new(wiki_image_repository);
    let wiki_image_controller = WikiImageController::new(wiki_image_usecases);

    let label_repository = D1LabelRepository::new(db.clone());
    let label_usecases = LabelUsecases::new(label_repository);
    let label_controller = LabelController::new(label_usecases);

    let anniversary_repository = D1AnniversaryRepository::new(db.clone());
    let anniversary_usecases = AnniversaryUsecases::new(anniversary_repository);
    let anniversary_controller = AnniversaryController::new(anniversary_usecases);

    let inventory_repository = D1InventoryRepository::new(db.clone());
    let inventory_usecases = InventoryUsecases::new(inventory_repository);
    let inventory_controller = InventoryController::new(inventory_usecases);

    let shopping_note_repository = D1ShoppingNoteRepository::new(db.clone());
    let shopping_note_usecases = ShoppingNoteUsecases::new(shopping_note_repository);
    let shopping_note_controller = ShoppingNoteController::new(shopping_note_usecases);

    let inventory_type_repository = D1InventoryTypeRepository::new(db.clone());
    let inventory_type_usecases = InventoryTypeUsecases::new(inventory_type_repository);
    let inventory_type_controller = InventoryTypeController::new(inventory_type_usecases);

    let task_repository = D1TaskRepository::new(db.clone());
    let task_usecases = TaskUsecases::new(task_repository);
    let task_controller = TaskController::new(task_usecases);

    let task_comment_repository = D1TaskCommentRepository::new(db.clone());
    let task_comment_usecases = TaskCommentUsecases::new(task_comment_repository);
    let task_comment_controller = TaskCommentController::new(task_comment_usecases);

    let web_push_subscription_repository = D1WebPushSubscriptionRepository::new(db);
    let web_push_subscription_usecases = WebPushSubscriptionUsecases::new(web_push_subscription_repository);
    let web_push_subscription_controller = WebPushSubscriptionController::new(web_push_subscription_usecases);

    let app_state = AppState {
        household_controller,
        schedule_controller,
        wiki_controller,
        wiki_image_controller,
        label_controller,
        anniversary_controller,
        inventory_controller,
        shopping_note_controller,
        inventory_type_controller,
        task_controller,
        task_comment_controller,
        web_push_subscription_controller,
    };


    Router::with_data(app_state)
     //household
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
     //wiki_image
        .get_async("/v2/wiki_image/:id", |_req, ctx| async move {
            ctx.data.wiki_image_controller.get_wiki_images_by_id(&ctx).await
        })
        .post_async("/v2/wiki_image/create", |mut req, ctx| async move {
            ctx.data.wiki_image_controller.create_wiki_image(&mut req).await
        })
        .post_async("/v2/wiki_image/delete", |mut req, ctx| async move {
            ctx.data.wiki_image_controller.delete_wiki_image(&mut req).await
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
     //inventory
        .get_async("/v2/inventory", |_req, ctx| async move {
            ctx.data.inventory_controller.get_inventories().await
        })
        .post_async("/v2/inventory/create", |mut req, ctx| async move {
            ctx.data.inventory_controller.create_inventory(&mut req).await
        })
        .post_async("/v2/inventory/update_amount", |mut req, ctx| async move {
            ctx.data.inventory_controller.update_amount(&mut req).await
        })
        .post_async("/v2/inventory/update", |mut req, ctx| async move {
            ctx.data.inventory_controller.update_inventory(&mut req).await
        })
        .post_async("/v2/inventory/delete", |mut req, ctx| async move {
            ctx.data.inventory_controller.delete_inventory(&mut req).await
        })
     //shopping_note
        .get_async("/v2/shopping_note", |_req, ctx| async move {
            ctx.data.shopping_note_controller.get_shopping_notes().await
        })
        .post_async("/v2/shopping_note/create", |mut req, ctx| async move {
            ctx.data.shopping_note_controller.create_shopping_note(&mut req).await
        })
        .post_async("/v2/shopping_note/register_to_inventory", |mut req, ctx| async move {
            ctx.data.shopping_note_controller.register_to_inventory(&mut req).await
        })
        .post_async("/v2/shopping_note/update", |mut req, ctx| async move {
            ctx.data.shopping_note_controller.update_shopping_note(&mut req).await
        })
        .post_async("/v2/shopping_note/delete", |mut req, ctx| async move {
            ctx.data.shopping_note_controller.delete_shopping_note(&mut req).await
        })
     //inventory_type
        .get_async("/v2/inventory_type", |_req, ctx| async move {
            ctx.data.inventory_type_controller.get_inventory_types().await
        })
        .get_async("/v2/inventory_type/is_used_for_inventory/:id", |_req, ctx| async move {
            ctx.data.inventory_type_controller.is_used_for_inventory(&ctx).await
        })
        .post_async("/v2/inventory_type/create", |mut req, ctx| async move {
            ctx.data.inventory_type_controller.create_inventory_type(&mut req).await
        })
        .post_async("/v2/inventory_type/update", |mut req, ctx| async move {
            ctx.data.inventory_type_controller.update_inventory_type(&mut req).await
        })
        .post_async("/v2/inventory_type/delete", |mut req, ctx| async move {
            ctx.data.inventory_type_controller.delete_inventory_type(&mut req).await
        })
     //task
        .get_async("/v2/task", |_req, ctx| async move {
            ctx.data.task_controller.get_tasks().await
        })
        .get_async("/v2/task/related_sub_task/:id", |_req, ctx| async move {
            ctx.data.task_controller.get_related_sub_tasks(&ctx).await
        })
        .get_async("/v2/task/:id", |_req, ctx| async move {
            ctx.data.task_controller.get_task_by_id(&ctx).await
        })
        .post_async("/v2/task/create", |mut req, ctx| async move {
            ctx.data.task_controller.create_task(&mut req).await
        })
        .post_async("/v2/task/update", |mut req, ctx| async move {
            ctx.data.task_controller.update_task(&mut req).await
        })
        .post_async("/v2/task/delete", |mut req, ctx| async move {
            ctx.data.task_controller.delete_task(&mut req).await
        })
     //task_comment
        .get_async("/v2/task_comment/:task_id", |_req, ctx| async move {
            ctx.data.task_comment_controller.get_task_comments_by_task_id(&ctx).await
        })
        .get_async("/v2/task_comment/has_comments/:task_id", |_req, ctx| async move {
            ctx.data.task_comment_controller.has_comments(&ctx).await
        })
        .post_async("/v2/task_comment/create", |mut req, ctx| async move {
            ctx.data.task_comment_controller.create_task_comment(&mut req).await
        })
        .post_async("/v2/task_comment/update", |mut req, ctx| async move {
            ctx.data.task_comment_controller.update_task_comment(&mut req).await
        })
        .post_async("/v2/task_comment/delete", |mut req, ctx| async move {
            ctx.data.task_comment_controller.delete_task_comment(&mut req).await
        })
     //web_push_subscription
        .get_async("/v2/web_push_subscription", |_req, ctx| async move {
            ctx.data.web_push_subscription_controller.get_web_push_subscriptions().await
        })
        .get_async("/v2/web_push_subscription/:subscription_id", |_req, ctx| async move {
            ctx.data.web_push_subscription_controller.get_web_push_subscription_by_subscription_id(&ctx).await
        })
        .post_async("/v2/web_push_subscription/create", |mut req, ctx| async move {
            ctx.data.web_push_subscription_controller.create_web_push_subscription(&mut req).await
        })
        .post_async("/v2/web_push_subscription/delete", |mut req, ctx| async move {
            ctx.data.web_push_subscription_controller.delete_web_push_subscription(&mut req).await
        })
    .run(req, env)
    .await
    .map(|resp| resp.with_headers(headers))
}
