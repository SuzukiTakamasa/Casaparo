use worker::*;

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
            Response::from_json(&result.results::<models::Household>().unwrap())
        })
        .get_async("/schedule", |_, ctx| async move {
            let year = ctx.param("year").unwrap();
            let month = ctx.param("month").unwrap();
            let d1 = ctx.env.d1("DB")?;
            let statement = d1.prepare("select * from schedules where year = ?1 and month = ?2");
            let query = statement.bind(&[year.into(), month.into()])?;
            let result = query.all().await?;
            Response::from_json(&result.results::<models::Schedule>().unwrap())
        })
    .run(req, env)
    .await
}
