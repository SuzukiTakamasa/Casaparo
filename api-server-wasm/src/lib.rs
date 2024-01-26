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
            Response::ok("household data was created.")
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
            Response::ok("schedule data was created.")
        })
    .run(req, env)
    .await
}
