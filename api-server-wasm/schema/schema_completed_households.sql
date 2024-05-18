DROP TABLE IF EXISTS completed_households;
CREATE TABLE completed_households (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    billing_amount INTEGER NOT NULL,
    total_amount INTEGER NOT NULL
);