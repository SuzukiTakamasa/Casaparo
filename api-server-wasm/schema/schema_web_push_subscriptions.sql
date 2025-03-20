DROP TABLE IF EXISTS web_push_subscriptions;
CREATE TABLE web_push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT UNIQUE NOT NULL,
    p256h_key DEFAULT NULL,
    auth_key DEFAULT NULL,
    version INTEGER NOT NULL
)