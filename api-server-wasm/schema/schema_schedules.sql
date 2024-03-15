DROP TABLE IF EXISTS schedules;
CREATE TABLE schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    from_date INTEGER NOT NULL,
    to_date INTEGER NOT NULL,
    from_time TEXT NOT NULL,
    to_time TEXT NOT NULL,
    created_by TEXT NOT NULL,
    label_id TEXT NOT NULL,
    version INTEGER NOT NULL
)