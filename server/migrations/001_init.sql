CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  token_count INTEGER,
  billing_period TEXT NOT NULL DEFAULT 'monthly',
  is_unlimited BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_plan TEXT NOT NULL,
  token_count INTEGER,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_unlimited BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active',
  payment_provider TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_end_date_idx ON subscriptions(end_date);

CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_description JSONB NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON resumes(user_id);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_token_hash_idx ON sessions(token_hash);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_payment_id TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_provider_payment_id_idx ON payments(provider_payment_id);

INSERT INTO pricing (name, description, price, token_count, billing_period, is_unlimited)
VALUES
  (
    'start',
    '??????? ???????, ?????? AI-?????? ??????, ?????????? ????????: 100',
    5.99,
    100,
    'monthly',
    FALSE
  ),
  (
    'pro',
    '??? ??????????? Start, ?????????? ????????: 500',
    15.00,
    500,
    'monthly',
    FALSE
  ),
  (
    'business',
    '??????? ???????? ??? ??????? ? ???????????',
    200.00,
    NULL,
    'yearly',
    TRUE
  )
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  token_count = EXCLUDED.token_count,
  billing_period = EXCLUDED.billing_period,
  is_unlimited = EXCLUDED.is_unlimited,
  updated_at = NOW();
