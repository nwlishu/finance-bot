CREATE TABLE IF NOT EXISTS wallets (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    currency   VARCHAR(10) DEFAULT 'THB',
    timezone   VARCHAR(64) DEFAULT 'Asia/Bangkok',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_wallets_user_default
    ON wallets(user_id)
    WHERE is_default = TRUE AND deleted_at IS NULL;
