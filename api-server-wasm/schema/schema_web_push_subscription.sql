CREATE TABLE web_push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    endpoint TEXT UNIQUE NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    metadata TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TEXT NOT NULL,
    version INTEGER DEFAULT 0
)