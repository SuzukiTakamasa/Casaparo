DROP TABLE IF EXISTS shopping_notes;
CREATE TABLE shopping_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notes TEXT NOT NULL,
    is_registered BOOLEAN NOT NULL,
    version INTEGER NOT NULL
)