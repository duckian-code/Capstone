ALTER TABLE stickies
ADD COLUMN title TEXT NOT NULL DEFAULT '';

ALTER TABLE stickies
ADD COLUMN color TEXT NOT NULL DEFAULT 'green'
CHECK (color IN ('red', 'blue', 'green', 'yellow', 'violet'));