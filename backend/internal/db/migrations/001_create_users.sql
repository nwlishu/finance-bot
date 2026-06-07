CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    line_user_id  VARCHAR(64) UNIQUE NOT NULL,
    display_name  VARCHAR(255),
    picture_url   TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_line_user_id ON users(line_user_id);
