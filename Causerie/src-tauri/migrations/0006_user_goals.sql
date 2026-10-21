CREATE TABLE goal_catalog (
    id TEXT PRIMARY KEY NOT NULL,
    label TEXT NOT NULL,
    display_order INTEGER NOT NULL CHECK (display_order >= 0),
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1))
);

CREATE TABLE user_goals (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id TEXT NOT NULL REFERENCES goal_catalog(id),
    slot INTEGER NOT NULL CHECK (slot IN (0, 1, 2)),
    PRIMARY KEY (user_id, slot),
    UNIQUE (user_id, goal_id)
);

CREATE TABLE goal_catalog_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    initialized INTEGER NOT NULL DEFAULT 0
        CHECK (initialized IN (0, 1))
);

INSERT INTO goal_catalog_state (id, initialized) VALUES (1,0);