use worker::*;

mod models;

#[event(fetch, respond_with_errors)]
async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {

    Router::new()
        .get_async("/household", |_, ctx| async move {
            let d1 = ctx.env.d1("DB")?;
            let statement = d1.prepare("select * from households");
            let result = statement.all().await?;
            Response::from_json(&result.results::<models::Household>().unwrap())
        })
        .get_async("/schedule", |_, ctx| async move {
            let d1 = ctx.env.d1("DB")?;
            let statement = d1.prepare("select * from schedules");
            let result = statement.all().await?;
            Response::from_json(&result.results::<models::Schedule>().unwrap())
        })
    .run(req, env)
    .await
}
