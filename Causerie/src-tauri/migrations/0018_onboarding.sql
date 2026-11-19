-- Preserve completed installations; new profiles may be active before essentials finish.
CREATE TABLE app_state_new (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    active_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    onboarding_completed_at TEXT
);
INSERT INTO app_state_new SELECT id, active_user_id, onboarding_completed_at FROM app_state;
DROP TABLE app_state;
ALTER TABLE app_state_new RENAME TO app_state;
CREATE TABLE onboarding_progress (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);