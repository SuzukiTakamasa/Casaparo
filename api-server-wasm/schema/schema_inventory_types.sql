DROP TABLE IF EXISTS inventory_types;
CREATE TABLE inventory_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    types TEXT NOT NULL,
    version INTEGER NOT NULL
);