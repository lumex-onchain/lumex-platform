# Lumex Fiat Corridor Guide

Each corridor defines how fiat money enters and exits the Lumex platform
for traders in a specific country. Corridors are configured in
`packages/corridor-configs/corridors/<CODE>/config.json`.

## Adding a new corridor

1. Create a directory: `packages/corridor-configs/corridors/<CODE>/`
2. Add `config.json` conforming to `schemas/corridor.schema.json`
3. Add `README.md` with banking partner notes and regulatory requirements
4. Run `npm run validate -w packages/corridor-configs` to check schema
5. Open a PR with label `package:corridor`
6. If this is a Wave issue, use the `wave:trivial` or `wave:medium` label

## Current corridors

| Code | Country       | Status   | MGUSD | Settlement method |
|------|---------------|----------|-------|-------------------|
| NGN  | Nigeria       | Planned  | ✓     | Local bank (PSSP) |
| KES  | Kenya         | Planned  | ✓     | Mobile money      |
| GHS  | Ghana         | Planned  | ✗     | Local bank        |
| ZAR  | South Africa  | Testnet  | ✗     | Local bank        |
| BRL  | Brazil        | Planned  | ✗     | PIX instant       |

## Planned corridors (Wave contribution opportunities)

| Code | Country            | Wave issue |
|------|--------------------|------------|
| XOF  | Francophone W.Africa| #27 (trivial) |
| EGP  | Egypt              | Open — create issue |
| INR  | India              | Open — create issue |
| PHP  | Philippines        | Open — create issue |

## Corridor config schema

See `packages/corridor-configs/schemas/corridor.schema.json` for full schema.

Key fields:
- `code` — ISO 4217 currency code
- `assets` — Stellar assets accepted for this corridor (USDC, MGUSD, etc.)
- `bankingPartner` — the licensed fiat on/off-ramp for this country
- `limits.minDepositUsd` — minimum deposit in USD equivalent
- `feeStructure.depositFeePct` — percentage fee applied at deposit
- `mgusdEnabled` — whether MoneyGram MGUSD is accepted as a deposit asset
- `status` — `active` | `testnet` | `planned`
