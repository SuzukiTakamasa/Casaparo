use crate::domain::entities::task::Tasks;
use crate::domain::entities::service::LatestVersion;
use crate::domain::repositories::task_repository::TaskRepository;
use crate::{optimistic_lock, worker_error};
use crate::async_trait::async_trait;
use worker::{D1Database, Result};
use std::sync::Arc;

pub struct D1TaskRepository {
    db :Arc<D1Database>
}

impl D1TaskRepository {
    pub fn new(db: Arc<D1Database>) -> Self {
        Self { db }
    }
}

#[async_trait(?Send)]
impl TaskRepository for D1TaskRepository {
    async fn get_tasks(&self) -> Result<Vec<Tasks>> {
        let query = self.db.prepare(r#"select *
                                                            from tasks
                                                            order by status asc, id desc"#);
        let result = query.all().await?;
        result.results::<Tasks>()
    }

    async fn get_related_sub_tasks(&self, id: u32) -> Result<Vec<Tasks>> {
        let statement = self.db.prepare(r#"select *
                                                                from tasks
                                                                where parent_task_id = ?1"#);
        let query = statement.bind(&[id.into()])?;
        let result = query.all().await?;
        result.results::<Tasks>()
    }

    async fn get_task_by_id(&self, id: u32) -> Result<Tasks> {
        let statement = self.db.prepare(r#"select *
                                                                from tasks
                                                                where id = ?1"#);
        let query = statement.bind(&[id.into()])?;
        let result = query.first::<Tasks>(None).await?;
        match result {
            Some(task) => Ok(task),
            None => worker_error!(format!("A task with id {} is not found.", id))
        }
    }

    async fn create_task(&self, task: &Tasks) -> Result<()> {
        let statement = self.db.prepare(r#"insert into tasks
                                                                (title, status, priority, description, created_by, updated_at, due_date, parent_task_id, version)
                                                                values (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)"#);
        let query = statement.bind(&[task.title.clone().into(),
                                                          task.status.into(),
                                                          task.priority.into(),
                                                          task.description.clone().into(),
                                                          task.created_by.into(),
                                                          task.updated_at.clone().into(),
                                                          task.due_date.clone().into(),
                                                          task.parent_task_id.into(),
                                                          task.version.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn update_task(&self, task: &mut Tasks) -> Result<()> {
        let fetch_version_statement = self.db.prepare("select version from tasks where id = ?1");
        let fetch_version_query = fetch_version_statement.bind(&[task.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, task);

        let statement = self.db.prepare(r#"update tasks
                                                                set title = ?1,
                                                                status = ?2,
                                                                priority = ?3,
                                                                description = ?4,
                                                                created_by = ?5,
                                                                updated_at = ?6,
                                                                due_date = ?7,
                                                                parent_task_id = ?8,
                                                                version = ?9
                                                                where id = ?10"#);
        let query = statement.bind(&[task.title.clone().into(),
                                                          task.status.into(),
                                                          task.priority.into(),
                                                          task.description.clone().into(),
                                                          task.created_by.into(),
                                                          task.updated_at.clone().into(),
                                                          task.due_date.clone().into(),
                                                          task.parent_task_id.into(),
                                                          task.version.into(),
                                                          task.id.into()])?;
        query.run().await?;
        Ok(())
    }

    async fn delete_task(&self, task: &mut Tasks) -> Result<()> {
        let fetch_version_statement = self.db.prepare(r#"select version
                                                                              from tasks
                                                                              where id = ?1"#);
        let fetch_version_query = fetch_version_statement.bind(&[task.id.into()])?;
        let fetch_version_result = fetch_version_query.first::<LatestVersion>(None).await?;
        optimistic_lock!(fetch_version_result, task);
        
        let statement = self.db.prepare(r#"delete
                                                                from tasks
                                                                where id = ?1"#);
        let query = statement.bind(&[task.id.into()])?;
        query.run().await?;
        Ok(())
    }
}