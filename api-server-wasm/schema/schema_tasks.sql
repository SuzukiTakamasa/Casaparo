DROP TABLE IF EXISTS tasks;
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status INTEGER NOT NULL,
    priority INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    updated_at TEXT NOT NULL,
    due_date TEXT NOT NULL,
    is_sub_task INTEGER NOT NULL,
    parent_task_id INTEGER NOT NULL,
    version INTEGER NOT NULL
);