DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('expense', 'income');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS transactions (
    id               SERIAL PRIMARY KEY,
    wallet_id        INTEGER NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type             transaction_type NOT NULL DEFAULT 'expense',
    amount           NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    category         VARCHAR(100),
    note             TEXT,
    raw_message      TEXT,
    transaction_date DATE NOT NULL,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW(),
    deleted_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id   ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date      ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category  ON transactions(category);
