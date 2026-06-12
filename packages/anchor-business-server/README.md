<div align="center">

# `@lumex/anchor-business-server`

### SEP-12 KYC · SEP-38 Quotes · Anchor Platform callbacks

*The business logic layer between the Stellar Anchor Platform and Lumex*

---

[![Wave Issues](https://img.shields.io/badge/Wave%20Issues-5%20open-brightgreen?style=flat-square)](https://github.com/lumex-onchain/lumex/issues?q=label%3Apackage%3Abusiness-server+is%3Aopen)
[![Wave Points](https://img.shields.io/badge/Wave%20Points-750%20available-gold?style=flat-square)](https://github.com/lumex-onchain/lumex/issues?q=label%3Apackage%3Abusiness-server)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square)](https://www.typescriptlang.org/)

</div>

---

## Overview

The official Stellar Anchor Platform (Docker image from SDF) manages the SEP protocol state machine — it knows when a transaction is pending, complete, or expired. But it delegates all *business decisions* to an external server: Is this user KYC-verified? What exchange rate applies? What fees?

`@lumex/anchor-business-server` is that external server. It implements every endpoint the Anchor Platform calls during the deposit and withdrawal lifecycle:

- **SEP-12** — KYC status checks (`GET /sep12/customer`), field submission (`PUT /sep12/customer`), and GDPR erasure (`DELETE /sep12/customer`)
- **SEP-38** — Indicative prices (`GET /sep38/prices`) and firm quotes (`POST /sep38/quote`)
- **Callbacks** — Receives completion events from the Anchor Platform and relays them to `@lumex/bridge-core`

---

## Package structure

```
packages/anchor-business-server/
├── src/
│   ├── index.ts               # Express app — route registration and startup
│   ├── sep12/
│   │   ├── router.ts          # GET / PUT / DELETE /sep12/customer
│   │   ├── getCustomer.ts     # KYC status check — returns tier + required fields
│   │   ├── putCustomer.ts     # ✦ Submit KYC fields → create/update Sumsub applicant
│   │   ├── deleteCustomer.ts  # GDPR erasure — nullify PII, retain anonymised audit record
│   │   └── tierRequirements.ts  # Field requirements per tier (TIER_1 / TIER_2 / TIER_3)
│   ├── sep38/
│   │   ├── router.ts          # GET /prices, POST /quote, GET /quote/:id
│   │   ├── getPrices.ts       # ✦ Live FX rates with Redis 30s TTL caching
│   │   ├── getQuote.ts        # ✦ Firm quote creation, DB persistence, fee calculation
│   │   └── getQuoteById.ts    # Quote retrieval by ID
│   ├── callbacks/
│   │   └── router.ts          # POST /callbacks/deposit and /callbacks/withdraw
│   ├── middleware/
│   │   ├── auth.ts            # JWT verification + request logger
│   │   └── errorHandler.ts    # Structured error responses
│   └── utils/
│       └── db.ts              # ✦ PostgreSQL user/KYC queries (to implement)
└── config/                    # Anchor Platform YAML reference configs
```

---

## How SEP-12 works in Lumex

The Anchor Platform calls `GET /sep12/customer?account=<STELLAR_ADDRESS>` before permitting any deposit or withdrawal. The business server responds with one of four statuses:

| Status | Meaning | What happens next |
|---|---|---|
| `NEEDS_INFO` | New user — return required fields | User completes KYC via frontend |
| `PROCESSING` | KYC submitted, provider is checking | User waits; webhook will update status |
| `ACCEPTED` | KYC passed | Deposit or withdrawal proceeds |
| `REJECTED` | KYC failed | Transaction blocked; user contacts support |

### KYC tiers and MT4 account groups

Lumex uses a three-tier trust model that maps directly to MetaTrader account groups:

| Tier | Requirements | MT4 group | Capabilities |
|---|---|---|---|
| TIER_1 | Email + phone | `retail_micro` | Micro positions only, no leverage |
| TIER_2 | Full document KYC (ID + address proof) | `retail_standard` | Up to 1:30 leverage |
| TIER_3 | Accredited investor attestation | `retail_pro` | Exotic pairs, institutional limits |

When a user's KYC tier upgrades (e.g., TIER_1 → TIER_2), the business server calls the bridge-core API to update the user's MT4 account group — the leverage change takes effect automatically.

---

## How SEP-38 works in Lumex

Before every deposit, the Anchor Platform fetches an exchange rate for the fiat-to-asset conversion:

1. `GET /sep38/prices` returns indicative rates for all five corridors (NGN, KES, GHS, ZAR, BRL)
2. Rates are cached in Redis with a 30-second TTL — live FX data without per-request API calls
3. `POST /sep38/quote` creates a firm quote valid for 60 seconds, stored in PostgreSQL
4. The corridor-specific fee structure from `@lumex/corridor-configs` is applied at quote creation
5. The Anchor Platform uses the firm quote ID throughout the transaction lifecycle

---

## Running locally

```bash
npm run docker:up
npm run dev:business-server
# → http://localhost:3001 with hot reload
```

```bash
curl http://localhost:3001/health
# → {"status":"ok","service":"lumex-business-server"}

curl http://localhost:3001/sep38/prices
# → {"buy_assets":[{"asset":"iso4217:NGN","price":"1550.00",...},...]}
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Port (default: `3001`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Validates JWTs from Anchor Platform |
| `WEBHOOK_SECRET` | Yes | HMAC secret for callback signature verification |
| `SUMSUB_APP_TOKEN` | Yes (prod) | Sumsub API app token |
| `SUMSUB_SECRET_KEY` | Yes (prod) | Sumsub HMAC signing secret |
| `ONFIDO_API_TOKEN` | Optional | Onfido alternative KYC provider |
| `FX_PROVIDER_URL` | Yes | FX rate provider base URL |
| `FX_API_KEY` | Yes | FX rate provider API key |
| `REDIS_URL` | Yes | Redis for quote and rate caching |

---

## Open Wave issues

| # | Title | Complexity | Points |
|---|---|---|---|
| [#10](https://github.com/lumex-onchain/lumex/issues/10) | Implement PostgreSQL DAL for users and KYC state | 🟡 Medium | 150 pts |
| [#11](https://github.com/lumex-onchain/lumex/issues/11) | Implement SEP-38 quote storage and retrieval | 🟡 Medium | 150 pts |
| [#12](https://github.com/lumex-onchain/lumex/issues/12) | Implement live FX price feed with Redis caching | 🟡 Medium | 150 pts |
| [#13](https://github.com/lumex-onchain/lumex/issues/13) | Integrate Sumsub KYC webhook for status updates | 🟡 Medium | 150 pts |
| [#14](https://github.com/lumex-onchain/lumex/issues/14) | Implement SEP-12 putCustomer with Sumsub applicant creation | 🟡 Medium | 150 pts |

**Recommended contributor profile:** Node.js / TypeScript REST API experience; understanding of webhook-driven flows; KYC or payment provider integration experience a plus.

---

## References

- [SEP-12 specification](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0012.md)
- [SEP-38 specification](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0038.md)
- [Stellar Anchor Platform docs](https://developers.stellar.org/docs/anchoring-assets/anchor-platform)
- [Sumsub API reference](https://developers.sumsub.com/api-reference/)
- [Onfido API documentation](https://documentation.onfido.com/)
