CREATE TABLE app_state (
                           id INTEGER PRIMARY KEY CHECK (id = 1),
                           active_user_id TEXT NOT NULL
                               REFERENCES users(id) ON DELETE CASCADE,
                           onboarding_completed_at TEXT NOT NULL
);
