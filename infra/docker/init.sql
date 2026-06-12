-- Lumex database schema
-- Run on first boot via Docker entrypoint

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users and ledger map
CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stellar_address   VARCHAR(56) UNIQUE NOT NULL,
  mt4_account_id    VARCHAR(64) UNIQUE,
  kyc_tier          VARCHAR(10) NOT NULL DEFAULT 'TIER_1',
  kyc_status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  corridor          VARCHAR(3)  NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_stellar ON users(stellar_address);
CREATE INDEX IF NOT EXISTS idx_users_mt4     ON users(mt4_account_id);

-- Deposit records
CREATE TABLE IF NOT EXISTS deposits (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES users(id),
  anchor_transaction_id   VARCHAR(128) UNIQUE NOT NULL,
  stellar_tx_hash         VARCHAR(64),
  amount                  NUMERIC(20,7) NOT NULL,
  asset                   VARCHAR(20)   NOT NULL,
  corridor                VARCHAR(3)    NOT NULL,
  status                  VARCHAR(30)   NOT NULL DEFAULT 'INITIATED',
  mt4_credit_tx_id        VARCHAR(128),
  soroban_escrow_tx_hash  VARCHAR(64),
  bank_confirmation_ref   VARCHAR(128),
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deposits_user   ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_anchor ON deposits(anchor_transaction_id);

-- Withdrawal records
CREATE TABLE IF NOT EXISTS withdrawals (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id),
  amount              NUMERIC(20,7) NOT NULL,
  asset               VARCHAR(20)   NOT NULL,
  corridor            VARCHAR(3)    NOT NULL,
  bank_account_name   VARCHAR(200),
  bank_account_number VARCHAR(64),
  bank_code           VARCHAR(32),
  bank_country        VARCHAR(3),
  status              VARCHAR(30)   NOT NULL DEFAULT 'REQUESTED',
  anchor_withdraw_id  VARCHAR(128),
  multisig_approvals  TEXT[]        NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- P&L records
CREATE TABLE IF NOT EXISTS pnl_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id),
  mt4_ticket      BIGINT NOT NULL,
  gross_pnl       NUMERIC(20,7) NOT NULL,
  commission      NUMERIC(20,7) NOT NULL DEFAULT 0,
  swap            NUMERIC(20,7) NOT NULL DEFAULT 0,
  net_pnl         NUMERIC(20,7) NOT NULL,
  settled_at      TIMESTAMPTZ,
  zk_proof_hash   VARCHAR(128),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pnl_ticket ON pnl_records(user_id, mt4_ticket);

-- On-chain event references (dual-ledger off-chain mirror)
CREATE TABLE IF NOT EXISTS ledger_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type      VARCHAR(30) NOT NULL,
  user_id         UUID NOT NULL REFERENCES users(id),
  amount          NUMERIC(20,7),
  asset           VARCHAR(20),
  soroban_tx_hash VARCHAR(64),
  zk_proof_hash   VARCHAR(128),
  ledger_seq      BIGINT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_user ON ledger_events(user_id);

-- SEP-38 quotes (short-lived)
CREATE TABLE IF NOT EXISTS quotes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sell_asset  VARCHAR(20) NOT NULL,
  sell_amount NUMERIC(20,7) NOT NULL,
  buy_asset   VARCHAR(20) NOT NULL,
  buy_amount  NUMERIC(20,7) NOT NULL,
  fee_total   NUMERIC(20,7),
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
