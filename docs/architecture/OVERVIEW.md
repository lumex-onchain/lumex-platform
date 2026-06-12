# Lumex Architecture Overview

## System layers

```
┌─────────────────────────────────────────────────────────┐
│  USER LAYER                                              │
│  Stellar wallet  ·  Web dashboard  ·  MT4/5 client       │
└──────────────┬──────────────────────────────────────────┘
               │ SEP-24 deposit / MT4 trade events
┌──────────────▼──────────────────────────────────────────┐
│  STELLAR ANCHOR PLATFORM                                  │
│  Platform API (SEP-6/24/38)  ·  Business Server (SEP-12) │
│  ZK Private Settlement (Protocol 25)                     │
└──────────────┬──────────────────────────────────────────┘
               │ /deposit_complete callback
┌──────────────▼──────────────────────────────────────────┐
│  CUSTOM MIDDLEWARE BRIDGE  ← core engineering deliverable│
│  Deposit handler  ·  P&L engine  ·  Withdrawal handler  │
│  User ledger map  ·  MGUSD on-ramp                       │
└──────────────┬──────────────────────────────────────────┘
               │ Soroban invocations
┌──────────────▼──────────────────────────────────────────┐
│  SOROBAN SMART CONTRACTS                                  │
│  Escrow (provisional credit)  ·  Risk engine             │
│  Multi-sig gate  ·  Dual ledger (on-chain record)        │
└──────────────┬──────────────────────────────────────────┘
               │ MT4 bridge plugin API (REST/WS)
┌──────────────▼──────────────────────────────────────────┐
│  METATRADER 4/5 PLATFORM                                  │
│  Bridge plugin API  ·  MT4/5 server  ·  Copy trading     │
│  Trade event webhook  ·  LP price feed                   │
└──────────────┬──────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────┐
│  EXTERNAL SYSTEMS                                         │
│  Banking partner  ·  KYC provider  ·  Compliance monitor │
│  DTCC tokenized collateral vault (2027)                  │
└─────────────────────────────────────────────────────────┘
```

## Deposit flow (steps 1–7)

1. User initiates deposit via Stellar wallet (SEP-24) or web dashboard
2. Platform API generates SEP-38 quote; SEP-12 checks KYC tier
3. KYC gate: TIER_1 (micro), TIER_2 (standard leverage), TIER_3 (pro)
4. User sends fiat to banking partner; bank confirms receipt
5. Anchor Platform fires `/deposit_complete` callback to middleware
6. Middleware locks Soroban escrow; bridge plugin credits MT4 account
7. MT4 balance updated; trader can trade immediately (provisional credit)

## Withdrawal flow (steps A–G)

A. Trader opens/closes positions via MT4 client
B. MT4 bridge plugin sends trade event webhook on position close
C. P&L engine calculates net USD P&L; updates user ledger
D. Withdrawal handler prepares SEP-6 withdraw request
E. If amount > $10,000: multi-sig gate requires 2-of-3 key approval
F. Anchor Platform calls SEP-6 withdraw; instructs banking partner
G. Banking partner sends fiat to user bank account

## Key differentiators

### Soroban escrow provisional credit
Conventional brokers hold deposits until T+1 to T+3. Lumex's Soroban escrow locks funds on-chain and credits MT4 within seconds — traders can open positions before the bank wire clears.

### Protocol 25 ZK settlement
P&L is settled via Groth16 proofs. The on-chain record proves settlement without exposing trade sizes or timing. Regulators hold view keys; competitors see only proof hashes.

### On-chain risk engine
Position limits, margin calls, and liquidation triggers are enforced at the Soroban contract level — not just in MT4 group settings. Risk parameters are auditable without a court order.

### Dual ledger
Every financial event is written to both PostgreSQL (operational) and the Soroban dual-ledger contract (immutable). Regulators can verify any historical event on-chain.

## Package dependency graph

```
@lumex/shared
    ↑
    ├── @lumex/anchor-business-server
    ├── @lumex/bridge-core
    │       ↑
    │       └── @lumex/compliance-sdk
    ├── @lumex/bridge-frontend
    └── @lumex/corridor-configs

@lumex/bridge-soroban (Rust — independent build)
```

## Environment variables

See `infra/docker/.env.example` for the full list.

Critical variables:
- `BRIDGE_SECRET_KEY` — Stellar keypair used to sign Soroban transactions
- `METAAPI_TOKEN` — MetaApi cloud account token for MT4/5 access
- `WEBHOOK_SECRET` — HMAC secret for validating Anchor Platform callbacks
- `ESCROW_CONTRACT_ADDRESS` — deployed Soroban escrow contract address
