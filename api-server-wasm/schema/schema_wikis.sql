DROP TABLE IF EXISTS wikis;
CREATE TABLE wikis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    updated_at TEXT NOT NULL,
    image_url TEXT DEFAULT NULL,
    version INTEGER NOT NULL
);