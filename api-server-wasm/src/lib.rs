use worker::*;
use serde_json::from_str;

mod models;

#[event(fetch, respond_with_errors)]
async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {

    Router::new()
        .get_async("/household", |_, ctx| async move {
            let year = ctx.param("year").unwrap();
            let month = ctx.param("month").unwrap();
            let d1 = ctx.env.d1("DB")?;
            let statement = d1.prepare("select * from households where year = ?1 and month = ?2");
            let query = statement.bind(&[year.into(), month.into()])?;
            let result = query.all().await?;
            Response::from_json(&result.results::<models::Households>().unwrap())
        })
        .get_async("/schedule", |_, ctx| async move {
            let year = ctx.param("year").unwrap();
            let month = ctx.param("month").unwrap();
            let d1 = ctx.env.d1("DB")?;
            let statement = d1.prepare("select * from schedules where year = ?1 and month = ?2");
            let query = statement.bind(&[year.into(), month.into()])?;
            let result = query.all().await?;
            Response::from_json(&result.results::<models::Schedules>().unwrap())
        })
        .post_async("/household/create", |mut req, ctx| async move {
            let json_body = req.text().await?;
            let household: models::Households = from_str(json_body.as_str()).unwrap();

            let d1 = ctx.env.d1("DB")?;
            let statement = d1.prepare("insert into households (name, amount, year, month, is_default, is_owner, version) values (?1, ?2, ?3, ?4, ?5, ?6, ?7)");
            let query = statement.bind(&[household.name.into(),
                                                              household.amount.into(),
                                                              household.year.into(),
                                                              household.month.into(),
                                                              household.is_default.into(),
                                                              household.is_owner.into(),
                                                              household.version.into()])?;
            let result = query.run().await?;
            console_log!("{:?}", result.success());
            Response::ok("Household data was created.")
        })
        .post_async("/household/update", |mut req, ctx| async move {
            let json_body = req.text().await?;
            let mut household: models::Households = from_str(json_body.as_str()).unwrap();

            let d1 = ctx.env.d1("DB")?;
            let fetch_version_statement = d1.prepare("select version from households where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[household.id.into()])?;
            let fetch_version_result = fetch_version_query.first::<models::Households>(None).await?;
            if let Some(latest) = fetch_version_result {
                if household.version == latest.version {
                    household.version += 1;
                } else {
                    return Response::error("Stale object error", 500);
                }
            } else {
                return Response::error("Failed to fetch version", 500);
            }
            let statement = d1.prepare("update households set name = ?1, amount = ?2, version = ?3 where id = ?4");
            let query = statement.bind(&[household.name.into(), household.amount.into(), household.version.into(), household.id.into()])?;
            let result = query.run().await?;
            console_log!("{:?}", result.success());
            Response::ok("Household data was updated.")
        })
        .post_async("/schedule/create", |mut req, ctx| async move {
            let json_body = req.text().await?;
            let schedule: models::Schedules = from_str(json_body.as_str()).unwrap();

            let d1 = ctx.env.d1("DB")?;
            let statement = d1.prepare("insert into schedules (description, year, month, date, from_time, to_time, version) values (?1, ?2, ?3, ?4, ?5, ?6, ?7)");
            let query = statement.bind(&[schedule.description.into(),
                                                              schedule.year.into(),
                                                              schedule.month.into(),
                                                              schedule.date.into(),
                                                              schedule.from_time.into(),
                                                              schedule.to_time.into(),
                                                              schedule.version.into()])?;
            let result = query.run().await?;
            console_log!("{:?}", result.success());
            Response::ok("Schedule data was created.")
        })
        .post_async("/schedule/update", |mut req, ctx| async move {
            let json_body = req.text().await?;
            let mut schedule: models::Schedules = from_str(json_body.as_str()).unwrap();

            let d1 = ctx.env.d1("DB")?;
            let fetch_version_statement = d1.prepare("select version from schedules where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[schedule.id.into()])?;
            let fetch_version_result = fetch_version_query.first::<models::Schedules>(None).await?;
            if let Some(latest) = fetch_version_result {
                if schedule.version == latest.version {
                    schedule.version += 1
                } else {
                    return Response::error("Stale object error", 500);
                }
            } else {
                return Response::error("Failed to fetch version", 500);
            }
            let statement = d1.prepare("update schedles set description = ?1, from_time = ?2, to_time = ?3 where id = ?4");
            let query = statement.bind(&[schedule.description.into(), schedule.from_time.into(), schedule.to_time.into(), schedule.id.into()])?;
            let result = query.run().await?;
            console_log!("{:?}", result.success());
            Response::ok("Schedue data was updated.")
        })
    .run(req, env)
    .await
}
