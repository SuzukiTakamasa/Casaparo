use worker::*;
use serde_json::from_str;

mod models;


fn get_db_env(req: &Request) -> Result<String> {
    let header_name = "Environment"; 
    match req.headers().get(header_name)? {
        Some(value) => Ok(value),
        None => Err(worker::Error::RustError(format!("Failed to get {} value", header_name))),
    }
}

#[event(fetch, respond_with_errors)]
async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {

    let mut headers = Headers::new();
    headers.set("Access-Control-Allow-Origin", "*")?;
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")?;
    headers.set("Access-Control-Allow-Headers", "*")?;

    if req.method() == Method::Options {
        return Response::empty()
            .map(|resp| resp.with_headers(headers))
    }

    Router::new()
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
            match result.results::<models::Households>() {
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
            match query.first::<models::FixedAmount>(None).await {
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
            match query.first::<models::IsCompleted>(None).await {
                Ok(is_completed) => Response::from_json(&is_completed),
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Error parsing results", 500)
                }
            }
        })
        .get_async("/schedule/:year/:month", |req, ctx| async move {
            let year = ctx.param("year").unwrap();
            let month = ctx.param("month").unwrap();
            let db_str = match get_db_env(&req) {
                Ok(val) => val,
                Err(e) => return Response::error(e.to_string(), 400)
            };
            
            let d1 = ctx.env.d1(db_str.as_str())?;
            let statement = d1.prepare("select * from schedules where year = ?1 and month = ?2");
            let query = statement.bind(&[year.into(), month.into()])?;
            let result = match query.all().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            match result.results::<models::Schedules>() {
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
            let query = d1.prepare("select * from wikis");
            let result = match query.all().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            match result.results::<models::Wikis>() {
                Ok(wikis) => Response::from_json(&wikis),
                Err(e) => {
                    console_log!("{:?}", e);
                    Response::error("Error pparsing results", 500)
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
            let household: models::Households = match from_str(json_body.as_str()) {
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
            let mut household: models::Households = match from_str(json_body.as_str()) {
                Ok(household) => household,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let fetch_version_statement = d1.prepare("select version from households where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[household.id.into()])?;
            let fetch_version_result = match fetch_version_query.first::<models::LatestVersion>(None).await {
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
            let mut household: models::Households = match from_str(json_body.as_str()) {
                Ok(household) => household,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let fetch_version_statement = d1.prepare("select version from households where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[household.id.into()])?;
            let fetch_version_result = match fetch_version_query.first::<models::LatestVersion>(None).await {
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
            let schedule: models::Schedules = match from_str(json_body.as_str()) {
                Ok(schedule) => schedule,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let statement = d1.prepare("insert into schedules (description, year, month, date, from_time, to_time, version) values (?1, ?2, ?3, ?4, ?5, ?6, ?7)");
            let query = statement.bind(&[schedule.description.into(),
                                                              schedule.year.into(),
                                                              schedule.month.into(),
                                                              schedule.date.into(),
                                                              schedule.from_time.into(),
                                                              schedule.to_time.into(),
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
            let mut schedule: models::Schedules = match from_str(json_body.as_str()) {
                Ok(schedule) => schedule,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let fetch_version_statement = d1.prepare("select version from schedules where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[schedule.id.into()])?;
            let fetch_version_result = match fetch_version_query.first::<models::LatestVersion>(None).await {
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
            let statement = d1.prepare("update schedules set description = ?1, from_time = ?2, to_time = ?3, version = ?4 where id = ?5");
            let query = statement.bind(&[schedule.description.into(),
                                                              schedule.from_time.into(),
                                                              schedule.to_time.into(),
                                                              schedule.id.into(),
                                                              schedule.version.into()])?;
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
            let mut schedule: models::Schedules = match from_str(json_body.as_str()) {
                Ok(schedule) => schedule,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let fetch_version_statement = d1.prepare("select version from schedules where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[schedule.id.into()])?;
            let fetch_version_result = match fetch_version_query.first::<models::LatestVersion>(None).await {
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
            let completed_household: models::CompletedHouseholds = match from_str(json_body.as_str()) {
                Ok(completed_household) => completed_household,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let statement = d1.prepare("insert into completed_households (year, month) values (?1, ?2)");
            let query = statement.bind(&[completed_household.year.into(),
                                                              completed_household.month.into()])?;
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
            let wiki: models::Wikis = match from_str(json_body.as_str()) {
                Ok(wiki) => wiki,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let statement = d1.prepare("insert into wikis (title, content, created_by, version) values (?1, ?2, ?3, ?4)");
            let query = statement.bind(&[wiki.title.into(),
                                                              wiki.content.into(),
                                                              wiki.created_by.into(),
                                                              wiki.version.into()])?;
            
            let result = match query.run().await {
                Ok(res) => res,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Query failed", 500)
                }
            };
            console_log!("{:?}", result.success());
            return Response::ok("A wiki was created")
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
            let mut wiki: models::Wikis = match from_str(json_body.as_str()) {
                Ok(wiki) => wiki,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let fetch_version_statement = d1.prepare("select version from wikis where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[wiki.id.into()])?;
            let fetch_version_result = match fetch_version_query.first::<models::LatestVersion>(None).await {
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
            let statement = d1.prepare("update wikis set title = ?1, content = ?2, created_by = ?3, version = ?4 where id = ?5");
            let query = statement.bind(&[wiki.title.into(),
                                                                         wiki.content.into(),
                                                                         wiki.created_by.into(),
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
            let mut wiki: models::Wikis = match from_str(json_body.as_str()) {
                Ok(wiki) => wiki,
                Err(e) => {
                    console_log!("{:?}", e);
                    return Response::error("Invalid request body", 400)
                }
            };

            let d1 = ctx.env.d1(db_str.as_str())?;
            let fetch_version_statement = d1.prepare("select version from wikis where id = ?1");
            let fetch_version_query = fetch_version_statement.bind(&[wiki.id.into()])?;
            let fetch_version_result = match fetch_version_query.first::<models::LatestVersion>(None).await {
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
            Response::ok("A wikis was deleted.")
        })
    .run(req, env)
    .await
    .map(|resp| resp.with_headers(headers))
}
