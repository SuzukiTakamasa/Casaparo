DROP TABLE IF EXISTS web_push_subscriptions;
CREATE TABLE web_push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_id TEXT UNIQUE NOT NULL,
    endpoint TEXT NOT NULL,
    expiration_time INTEGER DEFAULT NULL,
    p256h_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    version INTEGER NOT NULL
)