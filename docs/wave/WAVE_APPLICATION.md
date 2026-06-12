# Lumex — Stellar Wave 5 Programme Application

> Copy this text into the Drips Wave application form at https://drips.network/wave

---

## Project name
Lumex

## One-line description
The first open-source middleware bridge connecting a Stellar SEP-compliant Anchor Platform to MetaTrader 4/5 — enabling forex brokers to offer blockchain-speed settlement, ZK-proof P&L, and on-chain risk management.

## Project URL
https://github.com/lumex-phantom/lumex

## What does this project do?

Lumex (Lumen + Exchange) solves a gap that no existing Stellar project addresses: connecting the Stellar Anchor Platform's powerful SEP infrastructure (SEP-6/24/38/12) to a MetaTrader 4/5 trading engine via a custom open-source middleware bridge.

Forex brokers can deploy Lumex to offer traders:
- Near-instant deposits (Soroban escrow provisional credit — traders can trade within seconds)
- Confidential P&L settlement using Stellar Protocol 25 ZK proofs
- On-chain risk management via Soroban smart contracts (position limits, liquidation triggers, multi-sig withdrawal gates)
- Emerging market fiat corridors (NGN, KES, GHS, ZAR, BRL) with MoneyGram MGUSD stablecoin support

## Why does this matter for the Stellar ecosystem?

Lumex addresses SDF's Q1–Q2 2026 stated priorities directly:

**Agentic payments / automation:** The bridge middleware automates the full deposit-to-trade-to-settlement lifecycle with no human intervention, using Stellar's SEP protocols as the orchestration layer.

**ZK / privacy:** We integrate Stellar Protocol 25 Private Payments for confidential P&L settlement — the first forex product to use Stellar's ZK capabilities in a production workflow.

**Emerging markets:** Our primary launch corridors (NGN, KES, GHS) target markets where Stellar's payment infrastructure is strongest and where MT4-based retail forex has the largest user base but the slowest settlement.

**Institutional adoption:** The DTCC tokenized collateral module (designed for H1 2027 availability) creates the first tokenized margin product on Stellar, directly enabling institutional traders to hold tokenized T-bills as margin collateral.

No other Stellar project connects a full forex brokerage stack to the Anchor Platform. Cables Finance proved on-chain FX is viable. TD Markets proved regulated brokers can use Stellar assets. Lumex is the middleware layer that brings these together with the MetaTrader ecosystem that 80%+ of retail forex traders already use.

## How will Wave contributions improve the project?

Lumex is designed from the ground up as a contribution-first codebase. Every stub function contains a `TODO (wave:high|medium|trivial)` comment that maps directly to a labelled GitHub issue. The project was scaffolded specifically to create a large, high-quality surface area for Wave contributors.

**Wave contribution areas by package:**

| Package | Issues | Wave Points |
|---|---|---|
| bridge-core (Node.js + MetaApi) | 8 issues | 1,500 pts |
| bridge-soroban (Rust) | 5 issues | 1,000 pts |
| anchor-business-server (Node.js) | 5 issues | 750 pts |
| bridge-frontend (React) | 4 issues | 550 pts |
| compliance-sdk (Node.js) | 1 issue | 150 pts |
| corridor-configs (JSON) | 3 issues | 300 pts |
| docs | 2 issues | 200 pts |
| **Total** | **28 issues** | **4,500 pts** |

Each issue includes:
- A clear summary and context section
- An explicit acceptance criteria checklist (contributors know exactly when they're done)
- File references (contributors know exactly where to start)
- Links to relevant Stellar/MetaApi/Soroban documentation

We will review PRs within 24 hours during Wave sprints and within 48 hours otherwise. We use Conventional Commits and require tests for all functional changes.

## Repository structure

```
lumex/                              # Public monorepo
├── packages/
│   ├── anchor-business-server/    # SEP-12 KYC, SEP-38 quotes
│   ├── bridge-core/               # Core middleware (deposit/withdrawal/P&L)
│   ├── bridge-soroban/            # Soroban smart contracts (Rust)
│   ├── bridge-frontend/           # React dashboard
│   ├── compliance-sdk/            # AML/KYC provider wrappers
│   ├── corridor-configs/          # NGN, KES, GHS, ZAR, BRL configs
│   └── shared/                    # Shared types and utilities
├── infra/docker/                  # Docker Compose for local development
├── tools/issue-generator/         # Generates Wave issue JSON for GitHub
└── .github/
    ├── ISSUE_TEMPLATE/            # Wave bounty, bug, feature templates
    └── workflows/                 # CI: lint, test, Soroban test, corridor validation
```

## Languages and technologies

- **TypeScript / Node.js** — bridge-core, anchor-business-server, compliance-sdk, frontend
- **React + Vite** — bridge-frontend
- **Rust (Soroban SDK)** — bridge-soroban smart contracts
- **PostgreSQL** — operational database
- **Redis** — Bull job queues and rate caching
- **Stellar SDK (JS)** — Soroban RPC invocations, transaction building
- **stellar-sdk Rust** — (planned) direct Soroban contract builds

## Alignment with Stellar Development Foundation priorities

| SDF Priority | Lumex Feature |
|---|---|
| Agentic / automated payments | Fully automated SEP deposit-to-MT4 pipeline |
| ZK / privacy | Protocol 25 ZK proof P&L settlement |
| Cross-border remittance | NGN/KES/GHS fiat corridors + MGUSD |
| Institutional DeFi | Soroban risk engine, DTCC tokenized collateral (2027) |
| Developer tooling | Open-source, well-documented, contribution-ready |

## Maintainer commitment

We commit to:
- Reviewing all Wave applicant PRs within 24 hours during sprint weeks
- Assigning contributors within hours (not days) of a Wave opening
- Maintaining an active issue backlog with at least 10 open Wave-labelled issues at all times
- Not closing or reassigning issues from contributors who are actively engaged
- Publishing CHANGELOG.md updates after each merged Wave PR

## Contact
GitHub: https://github.com/lumex-phantom
