DROP TABLE IF EXISTS anniversaries;
CREATE TABLE anniversaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month INTEGER NOT NULL,
    date INTEGER NOT NULL,
    description TEXT NOT NULL,
    version INTEGER NOT NULL
);