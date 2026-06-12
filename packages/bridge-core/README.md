<div align="center">

# `@lumex/bridge-core`

### The engineering heart of Lumex

*Deposit callbacks · Soroban escrow client · MT4 credit/debit · P&L engine · Withdrawal gate*

---

[![Wave Issues](https://img.shields.io/badge/Wave%20Issues-8%20open-brightgreen?style=flat-square)](https://github.com/lumex-phantom/lumex/issues?q=label%3Apackage%3Abridge-core+is%3Aopen)
[![Wave Points](https://img.shields.io/badge/Wave%20Points-1500%20available-gold?style=flat-square)](https://github.com/lumex-phantom/lumex/issues?q=label%3Apackage%3Abridge-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square)](https://nodejs.org/)

</div>

---

## Overview

`@lumex/bridge-core` is the middleware that connects the Stellar Anchor Platform to MetaTrader 4/5. It sits between the blockchain layer and the trading engine, orchestrating the complete lifecycle of every deposit, trade, and withdrawal.

When a trader deposits funds, this package receives the `POST /deposit/complete` callback from the Anchor Platform, locks value in the Soroban escrow contract, and credits the MetaTrader account — all within seconds. When a trade closes, this package receives the trade event webhook, calculates net P&L, optionally generates a Protocol 25 ZK proof, and triggers the fiat withdrawal via SEP-6.

This is the primary contribution target for the Stellar Wave Programme. **Eight issues are open** with 1,500 Wave Points available in total.

---

## Architecture position

```
Anchor Platform                bridge-core                    Soroban + MT4
───────────────                ───────────                    ─────────────
POST /deposit/complete ──▶    depositHandler.ts   ──▶   escrowClient.ts
                               ledgerMap.ts         ──▶   dualLedger.ts (on-chain)
                               mt4Client.ts         ──▶   MetaApi SDK

MT4 bridge plugin      ──▶    pnl/router.ts         ──▶   dualLedger.ts
                               withdrawalHandler.ts  ──▶   SEP-6 API → bank
```

---

## Package structure

```
packages/bridge-core/
├── src/
│   ├── index.ts                   # Express app — startup and route registration
│   ├── deposit/
│   │   ├── router.ts              # POST /deposit/complete
│   │   └── depositHandler.ts      # ✦ Core deposit logic: validate → escrow → MT4 → ledger
│   ├── withdrawal/
│   │   └── withdrawalHandler.ts   # Withdrawal request, multi-sig gate, SEP-6 call
│   ├── pnl/
│   │   └── router.ts              # POST /trade/event — P&L calc + ZK proof
│   ├── ledger/
│   │   ├── dualLedger.ts          # PostgreSQL writes + Soroban on-chain record
│   │   └── ledgerMap.ts           # Stellar address ↔ MT4 account ID resolution
│   ├── mt4/
│   │   └── mt4Client.ts           # MetaApi SDK wrapper: credit, debit, balance, create account
│   ├── soroban/
│   │   └── escrowClient.ts        # Soroban escrow contract invocation client
│   ├── middleware/
│   │   ├── errorHandler.ts        # Structured error responses using LumexError
│   │   └── webhookAuth.ts         # HMAC-SHA256 signature verification
│   └── utils/
│       └── health.ts              # GET /health
└── tests/
    └── depositHandler.test.ts     # Unit tests with all dependencies mocked
```

---

## Running locally

From the repo root:

```bash
npm run docker:up      # start PostgreSQL, Redis, Kafka, Anchor Platform
npm run dev:bridge     # → http://localhost:3002 with hot reload
```

Verify:

```bash
curl http://localhost:3002/health
# → {"status":"ok","service":"lumex-bridge-core","timestamp":"..."}
```

---

## Environment variables

Set in `infra/docker/.env`. Copy from `.env.example`:

| Variable | Required | Description |
|---|---|---|
| `BRIDGE_PORT` | No | Port (default: `3002`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis URL for Bull queues |
| `METAAPI_TOKEN` | Yes (prod) | MetaApi cloud account token |
| `SOROBAN_RPC_URL` | Yes | Soroban RPC endpoint |
| `ESCROW_CONTRACT_ADDRESS` | Yes (prod) | Deployed escrow contract address |
| `BRIDGE_SECRET_KEY` | Yes | Stellar keypair for signing Soroban transactions |
| `WEBHOOK_SECRET` | Yes | HMAC-SHA256 secret for webhook validation |
| `LOG_LEVEL` | No | `info` / `debug` / `warn` (default: `info`) |

---

## API endpoints

All endpoints except `/health` require an `X-Lumex-Signature` header: `HMAC-SHA256(WEBHOOK_SECRET, JSON.stringify(body))`.

### `GET /health`
No auth. Returns `{"status":"ok","service":"lumex-bridge-core","timestamp":"..."}`.

### `POST /deposit/complete`
Triggered by the Stellar Anchor Platform on deposit completion. Runs the full deposit pipeline.

**Body:** `DepositCallbackPayload` (see `@lumex/shared`)

**Response:** `{"ok": true, "mt4CreditTxId": "string", "escrowTxHash": "string"}`

**Critical:** This endpoint must be idempotent. The Anchor Platform may re-deliver the same `transaction_id` on network failures. Re-delivery must not double-credit the MT4 account. See Wave issue #1.

### `POST /trade/event`
Triggered by the MT4 bridge plugin (Takeprofit Tech / Fortex / Brokeree) on position close.

**Body:** `TradeEvent` (see `@lumex/shared`)

**Response:** `{"ok": true, "netPnl": "95.42"}`

### `POST /withdrawal/request`
Initiates a withdrawal from MT4 balance.

**Body:** `{userId, amount, asset, bankDetails}`

**Response:** `{"status": "ANCHOR_SUBMITTED" | "MULTISIG_PENDING", "withdrawalId": "..."}`

---

## The deposit pipeline

`depositHandler.ts` is the most financially critical file in Lumex. A bug here risks double-crediting or missing credits. The function executes five steps in order:

```
1. Validate the callback payload (amount > 0, Stellar address present)
2. Resolve the MT4 account ID from the user ledger map
3. Call lockEscrow() on the Soroban escrow contract
4. Call creditMt4Account() via the MetaApi SDK
5. Record the deposit in the dual ledger (PostgreSQL + on-chain Soroban event)
```

Each step is currently scaffolded with a stub and a `TODO (wave:high)` comment pointing to the relevant Wave issue. The stubs allow the service to start and log — the Wave contribution work is replacing each stub with a real, tested implementation.

---

## Testing

```bash
npm test -w packages/bridge-core              # run all tests
npm test -w packages/bridge-core -- --coverage # with coverage report
npm test -w packages/bridge-core -- --watch    # watch mode during development
```

The test suite in `tests/depositHandler.test.ts` mocks all external dependencies (PostgreSQL, Soroban, MetaApi) using Jest. Tests run immediately after cloning without any live infrastructure. The mock setup is already configured — contributors can run tests right away and start writing new ones.

---

## Open Wave issues

| # | Title | Complexity | Points |
|---|---|---|---|
| [#1](https://github.com/lumex-phantom/lumex/issues/1) | Implement idempotency guard on deposit callback | 🔴 High | 200 pts |
| [#2](https://github.com/lumex-phantom/lumex/issues/2) | Implement MetaApi SDK integration for MT4 credit/debit | 🔴 High | 200 pts |
| [#3](https://github.com/lumex-phantom/lumex/issues/3) | Implement PostgreSQL DAL — user ledger map + deposits | 🔴 High | 200 pts |
| [#4](https://github.com/lumex-phantom/lumex/issues/4) | Implement Soroban escrow contract invocation | 🔴 High | 200 pts |
| [#5](https://github.com/lumex-phantom/lumex/issues/5) | Implement multi-sig withdrawal gate | 🔴 High | 200 pts |
| [#6](https://github.com/lumex-phantom/lumex/issues/6) | Add SEP-6 withdraw call to Anchor Platform | 🟡 Medium | 150 pts |
| [#7](https://github.com/lumex-phantom/lumex/issues/7) | Add Bull queue for reliable async deposit processing | 🟡 Medium | 150 pts |
| [#8](https://github.com/lumex-phantom/lumex/issues/8) | Implement ZK proof generation for P&L (Protocol 25) | 🔴 High | 200 pts |
| [#9](https://github.com/lumex-phantom/lumex/issues/9) | Add real-time deposit status WebSocket feed | 🟡 Medium | 150 pts |

**Recommended contributor profile:** TypeScript/Node.js dominant; REST API and webhook experience; financial or payments systems experience a plus. For issues #3–4, `stellar-sdk` and Soroban RPC knowledge is required.

---

## References

- [MetaApi Node.js SDK](https://github.com/agiliumtrade-ai/metaapi-node.js-sdk)
- [Stellar SDK — Soroban invocation](https://developers.stellar.org/docs/smart-contracts/guides/transactions/invoke-contract-with-code)
- [Stellar Anchor Platform callback API](https://developers.stellar.org/docs/anchoring-assets/anchor-platform/api-reference/platform-api)
- [Stellar Private Payments (Protocol 25 ZK)](https://github.com/stellar/stellar-private-payments)
- [Bull queue documentation](https://docs.bullmq.io/)
