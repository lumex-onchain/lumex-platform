<div align="center">

# `@lumex/compliance-sdk`

### AML screening · KYC provider integration · Operational monitoring

*Chainalysis KYT · Sumsub · Onfido · Prometheus*

---

[![Wave Issues](https://img.shields.io/badge/Wave%20Issues-1%20open-brightgreen?style=flat-square)](https://github.com/lumex-phantom/lumex/issues?q=label%3Apackage%3Acompliance-sdk+is%3Aopen)
[![Wave Points](https://img.shields.io/badge/Wave%20Points-150%20available-gold?style=flat-square)](https://github.com/lumex-phantom/lumex/issues?q=label%3Apackage%3Acompliance-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square)](https://www.typescriptlang.org/)

</div>

---

## Overview

`@lumex/compliance-sdk` provides reusable, well-typed helpers for every compliance integration Lumex touches. It is consumed by `@lumex/bridge-core` (AML screening on every deposit) and `@lumex/anchor-business-server` (KYC provider communication for SEP-12).

Forex brokers operating in regulated jurisdictions face three non-negotiable requirements:

- **AML screening** — every deposit address and transaction must be screened against known risk databases before funds are accepted
- **KYC identity verification** — users must be identity-verified before trading with leverage or withdrawing above micro-limits
- **Operational monitoring** — financial infrastructure needs real-time alerting on errors, latency spikes, and AML flags

This package wraps the third-party services that fulfil these requirements behind consistent interfaces, so `bridge-core` and `anchor-business-server` are never tightly coupled to a single vendor.

---

## Package structure

```
packages/compliance-sdk/
├── src/
│   ├── index.ts                  # Re-exports all public APIs
│   ├── aml/
│   │   └── chainalysis.ts        # ✦ Chainalysis KYT v2 — address + transaction screening
│   ├── kyc/
│   │   ├── sumsub.ts              # Sumsub applicant creation, status, access tokens
│   │   └── onfido.ts              # Onfido applicant creation, check results
│   └── monitoring/
│       └── prometheus.ts          # Metric names and instrumentation helpers
└── tests/
```

---

## AML screening — Chainalysis KYT

Every Stellar address that deposits into Lumex should be screened against Chainalysis's Know Your Transaction (KYT) database before the deposit is accepted. `screenAddress` is called from `bridge-core` at the start of the deposit pipeline.

**Risk levels and Lumex's response:**

| Risk | Meaning | Lumex action |
|---|---|---|
| `LOW` | No known associations | Proceed normally |
| `MEDIUM` | Indirect exposure to risky entities | Log and proceed; flag for manual review queue |
| `HIGH` | Direct exposure to high-risk entities (darknet, mixers) | Hold deposit; alert compliance officer |
| `SEVERE` | Direct OFAC/SDN sanctions list match | Reject deposit; file SAR if jurisdiction requires |

```typescript
import { screenAddress } from '@lumex/compliance-sdk';

const result = await screenAddress('GTEST123STELLARADDRESS');
// → { address: '...', risk: 'LOW', cluster: undefined, exposures: [] }

if (result.risk === 'HIGH' || result.risk === 'SEVERE') {
  // hold the deposit, alert ops, do not lock escrow
}
```

### Current status

`screenAddress` and `screenTransaction` are currently stubs returning `{ risk: 'LOW' }`. Wave issue #24 replaces this with a real Chainalysis KYT v2 integration including Redis caching of results to avoid re-screening the same address within 24 hours.

---

## KYC providers

### Sumsub — primary provider

Sumsub handles document verification, liveness checks, and AML watchlist screening. `anchor-business-server` uses Sumsub to fulfil the SEP-12 `PUT /customer` endpoint.

```typescript
import { createApplicant, getApplicantStatus, generateAccessToken } from '@lumex/compliance-sdk';

// Create an applicant when a user first submits KYC
const applicantId = await createApplicant({
  externalUserId: 'lumex-user-uuid',
  levelName: 'basic-kyc-level',
  email: 'user@example.com',
});

// Generate a short-lived token for the Sumsub Web SDK (frontend document upload UI)
const token = await generateAccessToken('lumex-user-uuid', 'basic-kyc-level');
```

### Onfido — alternative provider

Onfido is provided for markets where its document coverage is stronger (UK, EU). The interface mirrors Sumsub:

```typescript
import { createOnfidoApplicant, getOnfidoCheckResult } from '@lumex/compliance-sdk';

const applicantId = await createOnfidoApplicant({
  firstName: 'Ada',
  lastName: 'Obi',
  email: 'ada@example.com',
});
```

---

## Prometheus metrics

`monitoring/prometheus.ts` defines the metric names and instrumentation helpers all Lumex services should use — a consistent naming scheme so dashboards and alerts work the same across every service.

| Metric | Labels | Description |
|---|---|---|
| `lumex_deposits_total` | `status`, `corridor`, `asset` | Total deposit attempts by outcome |
| `lumex_deposit_duration_seconds` | `corridor` | Time from callback to MT4 credit |
| `lumex_withdrawals_total` | `status`, `corridor` | Total withdrawal requests by outcome |
| `lumex_mt4_credit_errors_total` | — | MT4 credit failures requiring ops intervention |
| `lumex_escrow_locks_total` | — | Successful Soroban escrow lock calls |
| `lumex_aml_flags_total` | `risk_level` | AML screening flags by severity |
| `lumex_pnl_settlements_total` | `zk_proof_included` | P&L settlements, with/without ZK proof |

```typescript
import { recordDeposit, recordMt4Error } from '@lumex/compliance-sdk';

// After each deposit outcome in depositHandler.ts
recordDeposit({ status: 'COMPLETE', corridor: 'NGN', asset: 'USDC' });

// On MT4 credit failure
recordMt4Error();
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `CHAINALYSIS_API_KEY` | Yes (prod) | Chainalysis KYT API key |
| `SUMSUB_APP_TOKEN` | Yes (prod) | Sumsub application token |
| `SUMSUB_SECRET_KEY` | Yes (prod) | Sumsub HMAC signing secret |
| `ONFIDO_API_TOKEN` | Optional | Onfido API token, if used |
| `REDIS_URL` | Yes (prod) | Redis for AML result caching |

---

## Open Wave issues

| # | Title | Complexity | Points |
|---|---|---|---|
| [#24](https://github.com/lumex-phantom/lumex/issues/24) | Implement Chainalysis KYT v2 address screening with Redis caching | 🟡 Medium | 150 pts |

**Recommended contributor profile:** Experience integrating third-party compliance/financial APIs; familiarity with AML/KYC regulatory concepts; Redis caching patterns.

---

## References

- [Chainalysis KYT API v2](https://docs.chainalysis.com/api/kyt/)
- [Sumsub API reference](https://developers.sumsub.com/api-reference/)
- [Onfido API documentation](https://documentation.onfido.com/)
- [prom-client (Prometheus Node.js)](https://github.com/siimon/prom-client)
