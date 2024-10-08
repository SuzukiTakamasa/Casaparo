/* v1
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
 */