# lumex-platform

**Open-source middleware bridge connecting Stellar Anchor Platform to MetaTrader 4/5**

Backend services for the Lumex bridge — KYC gating, FX quoting, deposit processing, P&L settlement, and MT4 account management. This is the core engineering deliverable of the Lumex system.

[Architecture](#architecture) · [Packages](#packages) · [Setup](#getting-started) · [API Reference](docs/api/API_REFERENCE.md) · [Contributing](#contributing--wave-programme) · [Wave Issues](https://github.com/lumex-onchain/lumex-platform/issues?q=is%3Aopen+label%3Awave%3Ahigh%2Cwave%3Amedium%2Cwave%3Atrivial)





---

## What This Repo Does

`lumex-platform` is the middleware layer between the Stellar blockchain and the MetaTrader trading infrastructure. It:

- **Receives deposit callbacks** from the Stellar Anchor Platform when a user's fiat-to-USDC conversion is confirmed
- **Locks provisional escrow** on Soroban — enabling MT4 account credit *before* the bank wire fully settles
- **Credits MT4 accounts** via the MetaApi bridge plugin REST/WebSocket interface
- **Processes P&L settlements** via Groth16 ZK proofs (Protocol 25), ensuring trade outcomes are proved on-chain without exposing position sizes
- **Handles withdrawals** by triggering the SEP-6 flow and routing through the multi-sig gate for high-value transfers
- **Enforces compliance** using Chainalysis AML monitoring, Onfido/Sumsub KYC, and on-chain risk limits
- **Writes the dual ledger** — every financial event lands in PostgreSQL (operational) and the Soroban dual-ledger contract (immutable audit trail)

---

## Architecture

```
lumex-platform (this repo)
├── packages/
│   ├── anchor-business-server/   ← SEP-12 KYC + SEP-38 FX quote endpoints
│   ├── bridge-core/              ← Deposit/withdrawal handlers + MT4 integration
│   ├── shared/                   ← TypeScript types + utilities (@lumex/shared)
│   ├── compliance-sdk/           ← AML/KYC utilities (Chainalysis, Onfido, Sumsub)
│   └── corridor-configs/         ← Per-corridor JSON config (NGN, KES, GHS, ZAR, BRL)
└── infra/docker/                 ← Docker Compose for local development
```

### System Context

```
Stellar Anchor Platform
  │
  │ /deposit_complete callback (POST)
  ▼
anchor-business-server  ──→  bridge-core  ──→  Soroban escrow contract
                                  │                (lumex-contracts)
                                  │
                                  ▼
                             MT4 bridge API (MetaApi)
                                  │
                                  ▼
                             Trader's MT4 account
                             (credited before wire clears)
```

---

## Packages

### `anchor-business-server`

Implements the Stellar SEP standards required for the Anchor Platform integration:

| Endpoint | SEP | Purpose |
|---|---|---|
| `GET /customer` | SEP-12 | Fetch KYC customer record |
| `PUT /customer` | SEP-12 | Submit KYC data for a tier upgrade |
| `DELETE /customer` | SEP-12 | GDPR-compliant customer deletion |
| `GET /prices` | SEP-38 | Live FX indicative rates (NGN/USDC, etc.) |
| `POST /quote` | SEP-38 | Firm FX quote locked for settlement |
| `GET /quote/:id` | SEP-38 | Fetch a previously created quote |
| `POST /callbacks/*` | SEP-24 | Deposit/withdrawal event callbacks from Platform |

KYC is tiered:

| Tier | MT4 Group | Position Limit | Leverage |
|---|---|---|---|
| `TIER_1` | `retail_micro` | $500 max position | 1:1 (no leverage) |
| `TIER_2` | `retail_standard` | Standard retail | Up to 1:30 |
| `TIER_3` | `retail_pro` | Institutional | Exotic pairs, custom limits |

### `bridge-core`

The critical deposit/withdrawal engine:

**Deposit flow (7 steps):**
1. Anchor Platform fires `POST /callbacks/deposit_complete`
2. `depositHandler.ts` validates payload and resolves MT4 account from Stellar address via ledger map
3. `escrowClient.ts` calls `lock_escrow()` on the Soroban escrow contract — funds are on-chain locked
4. `mt4Client.ts` credits the MT4 account via MetaApi — **trader can now trade**
5. `dualLedger.ts` writes to PostgreSQL (operational) and Soroban dual-ledger contract (immutable)
6. Bridge emits a structured event for real-time WebSocket status updates to the dashboard
7. Deposit status transitions: `AWAITING_BANK → ESCROW_LOCKED → MT4_CREDITED → COMPLETE`

**P&L settlement flow:**
1. MT4 bridge plugin sends trade close event webhook to `POST /pnl/trade-event`
2. P&L engine calculates net USD P&L (gross − commission − swap)
3. ZK proof generated via Protocol 25 Groth16; proof hash recorded on-chain
4. Net P&L credited/debited to user's ledger balance; withdrawal becomes available

**Withdrawal flow (7 steps):**
1. Trader submits withdrawal request via dashboard
2. If amount > $10,000 USD: multi-sig gate requires 2-of-3 bridge key approval
3. MT4 account debited via MetaApi
4. SEP-6 withdrawal request submitted to Anchor Platform
5. Anchor Platform routes to local banking partner for fiat disbursement
6. Withdrawal status: `REQUESTED → MULTISIG_PENDING → ANCHOR_SUBMITTED → BANK_PENDING → COMPLETE`

### `shared`

Published as `@lumex/shared` on GitHub Packages. Contains:

- **Types**: `DepositRecord`, `WithdrawalRecord`, `PnLRecord`, `TradeEvent`, `LumexUser`, `KycTier`, `CorridorCode`, `BankDetails`
- **Constants**: KYC tier → MT4 group mappings, asset issuer addresses
- **Utilities**: Structured logger (Pino), custom error classes (`DepositError`, `Mt4Error`), validation helpers

Consumed by `bridge-core`, `anchor-business-server`, `lumex-dashboard`, and `lumex-sdk`.

### `compliance-sdk`

Internal AML and KYC utilities:

- **Chainalysis**: Wallet screening and transaction monitoring integration
- **Onfido**: Identity document verification (Tier 2+ onboarding)
- **Sumsub**: Enhanced KYC with liveness checks (Tier 3 / institutional)
- **Prometheus**: Metrics exporter for compliance event monitoring

### `corridor-configs`

JSON configuration for each supported fiat corridor. Schema includes: asset codes and Stellar issuers, banking partner endpoint and settlement method, deposit/withdrawal limits (min, max, daily), fee structure (deposit %, withdrawal %, minimum), regulatory notes, and MGUSD enablement flag.

**Active corridors:**

| Corridor | Regulatory Authority | Banking Status | MGUSD |
|---|---|---|---|
| 🇳🇬 NGN | Central Bank of Nigeria | TBD — CBN-licensed PSSP required | ✅ |
| 🇰🇪 KES | Central Bank of Kenya | TBD — partner onboarding | ✅ |
| 🇬🇭 GHS | Bank of Ghana | TBD — partner onboarding | ✅ |
| 🇿🇦 ZAR | SARB / FSCA | TBD — partner onboarding | ✅ |
| 🇧🇷 BRL | Banco Central do Brasil | TBD — partner onboarding | ✅ |

Adding a new corridor requires only a JSON file matching the [corridor schema](packages/corridor-configs/schemas/corridor.schema.json) plus a banking partner integration in `bridge-core`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 LTS |
| Language | TypeScript 5.3 (strict mode) |
| Web framework | Express 4 |
| Database | PostgreSQL 16 |
| Cache / pub-sub | Redis 7 |
| MT4 integration | MetaApi SDK (REST + WebSocket) |
| Stellar SDK | `@stellar/stellar-sdk` |
| AML | Chainalysis KYT API |
| KYC | Onfido / Sumsub |
| Observability | Prometheus + Pino structured logging |
| Containerisation | Docker Compose (local), Kubernetes (production) |
| Package registry | GitHub Packages (`@lumex/shared`) |

---

## Prerequisites

- **Node.js 20+** — `node --version` should print `v20.x.x` or higher
- **Docker and Docker Compose** — for local PostgreSQL and Redis
- **GitHub personal access token** — for consuming `@lumex/shared` from GitHub Packages; generate with `read:packages` scope at **GitHub → Settings → Developer settings → Personal access tokens (classic)**

---

## Getting Started

### 1. Clone and configure authentication

```bash
git clone https://github.com/lumex-onchain/lumex-platform.git
cd lumex-platform
```

Create `.npmrc` in the repo root to authenticate against GitHub Packages:

```
@lumex:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

### 2. Configure environment

```bash
cp infra/docker/.env.example infra/docker/.env
```

Edit `infra/docker/.env` with your local secrets. Key variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `BRIDGE_SECRET_KEY` | Stellar keypair secret for signing contract invocations |
| `ESCROW_CONTRACT_ADDRESS` | Deployed Soroban escrow contract ID |
| `METAAPI_TOKEN` | MetaApi account token |
| `CHAINALYSIS_API_KEY` | AML monitoring key |
| `ONFIDO_API_TOKEN` | KYC provider token |
| `SOROBAN_RPC_URL` | Soroban RPC endpoint (testnet or mainnet) |

### 3. Start infrastructure and install dependencies

```bash
docker compose -f infra/docker/docker-compose.yml up -d   # Start PostgreSQL + Redis
npm install                                                # Install all packages
```

### 4. Run services

```bash
# anchor-business-server (port 8081)
cd packages/anchor-business-server && npm run dev

# bridge-core (port 8080)
cd packages/bridge-core && npm run dev
```

### 5. Run tests

```bash
cd packages/bridge-core
npm test                    # Run test suite
npm run type-check          # TypeScript strict mode check
```

---

## API Reference

See [`docs/api/API_REFERENCE.md`](docs/api/API_REFERENCE.md) for full endpoint documentation.

The Anchor Platform integration follows:
- [SEP-12](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0012.md) — KYC API
- [SEP-38](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0038.md) — Anchor RFQ
- [SEP-24](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0024.md) — Interactive deposit/withdrawal

---

## ZK Settlement Architecture

See [`docs/architecture/ZK_SETTLEMENT.md`](docs/architecture/ZK_SETTLEMENT.md) for the full ZK proof flow.

Summary: P&L for each closed MT4 position is proved via a Groth16 circuit (Protocol 25). The circuit takes as private inputs the open price, close price, volume, commission, and user ID hash. It outputs a proof attesting the net P&L value without revealing trade parameters. The proof hash is stored in the Soroban dual-ledger contract. Regulators with a view key can reconstruct the full trade record; on-chain observers see only the proof hash and the net settlement amount.

---

## Contributing & Wave Programme

This repository participates in the [Stellar Wave Programme](https://drips.network/wave/stellar/repos). Issues are labeled `wave:high`, `wave:medium`, `wave:trivial`, and `good-first-issue` for bounty eligibility.

### Where to start

| Label | Typical scope | Example |
|---|---|---|
| `good-first-issue` | Self-contained, well-specified | Add index to `stellar_address` column in ledger map |
| `wave:trivial` | Small, < 1 hour | Write unit test for `creditMt4Account` with MetaApi mocked |
| `wave:medium` | Moderate, < 1 day | Implement PostgreSQL-backed ledger map with upsert |
| `wave:high` | Complex, multi-step | Full MetaApi SDK integration for `creditMt4Account` + `debitMt4Account` |

### Development workflow

```bash
# Fork and clone
git checkout -b feat/your-feature

# Make changes with tests
npm run type-check  # Must pass
npm test            # Must pass

# Push and open PR
# Reference the issue: "Closes #123"
```

### Coding standards

- All code in TypeScript strict mode — no `any`, no implicit returns
- Every new function or class must have a JSDoc block
- `TODO (wave:*)` comments in stubs are the canonical specification for Wave bounties — implement exactly what they describe
- Tests go in `packages/<package>/tests/` using Jest (Node.js packages) or Vitest (ESM packages)
- Log all significant operations via the shared Pino logger with structured fields — never `console.log` in production paths

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

---

## Repository Connections

Part of the [lumex-onchain](https://github.com/lumex-onchain) organization:

| Repository | Role relative to this repo |
|---|---|
| [lumex-contracts](https://github.com/lumex-onchain/lumex-contracts) | Soroban contracts that `bridge-core` invokes (escrow, risk, dual-ledger) |
| [lumex-dashboard](https://github.com/lumex-onchain/lumex-dashboard) | Frontend that calls this repo's REST API |
| [lumex-sdk](https://github.com/lumex-onchain/lumex-sdk) | TypeScript SDK generated from this repo's OpenAPI spec |

The `@lumex/shared` package in `packages/shared/` is published to GitHub Packages and consumed by all other repos. Changes to shared types require coordinated updates across the org.

---

## Versioning

This repository uses [semantic versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`). Releases are tagged `vMAJOR.MINOR.PATCH`. Each package has its own independent version in `package.json`. See [CHANGELOG.md](CHANGELOG.md) for the release history.

---

## License

MIT © 2026 Lumex Contributors
