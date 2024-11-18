DROP TABLE IF EXISTS task_comments;
CREATE TABLE task_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_by INTEGER NOT NULL,
    updated_at TEXT NOT NULL,
    comment TEXT NOT NULL,
    task_id INTEGER NOT NULL,
    version INTEGER NOT NULL
);