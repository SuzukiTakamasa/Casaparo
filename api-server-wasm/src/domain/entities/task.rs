use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Tasks {
    pub id: Option<u32>,
    pub title: String,
    pub status: u8,
    pub priority: u8,
    pub description: String,
    pub created_by: u8,
    pub updated_at: String,
    pub due_date: String,
    pub is_sub_task: u8,
    pub parent_task_id: u32,
    pub version: u32
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TaskComments {
    pub id: Option<u32>,
    pub created_by: u8,
    pub updated_at: String,
    pub comment: String,
    pub task_id: u32,
    pub version: u32
}