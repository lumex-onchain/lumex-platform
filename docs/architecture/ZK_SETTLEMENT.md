# ZK Settlement Architecture

## Overview

Lumex uses Stellar Protocol 25 (X-Ray upgrade, mainnet January 2026) to settle
P&L records with Groth16 ZK proofs. The blockchain proves settlement happened
without exposing individual trade sizes, entry/exit prices, or counterparty
identities to the public.

## Why ZK for P&L settlement?

Conventional on-chain settlement exposes all trade data publicly. For a forex
broker this creates three problems:
1. **Front-running** — competitors see positions before settlement completes
2. **Information leakage** — institutional traders reveal strategy via on-chain records
3. **Regulatory privacy** — GDPR and financial regulations restrict publishing PII

ZK proofs solve all three: the proof cryptographically guarantees the settlement
is correct without revealing the underlying data.

## Components

```
Off-chain                           On-chain (Soroban)
─────────────────────────────────   ──────────────────────────────
1. P&L calculated in bridge-core
2. Proof inputs assembled:          4. Verifier contract checks proof
   - user_id_hash                      using BN254 / Poseidon
   - net_pnl                        5. LedgerEvent stored with
   - asset                             zk_proof_hash
   - timestamp                      6. Event emitted for Horizon index
3. Groth16 proof generated
   (Circom or RISC Zero)
   → compact proof (< 300 bytes)
```

## Proof circuit (planned)

```
Public inputs:
  - user_id_hash    (keccak256 of user_id — no PII on-chain)
  - net_pnl_range   (range proof: net_pnl is within declared range)
  - asset           (e.g. "USDC")
  - settlement_date (unix timestamp, day granularity)

Private inputs (known only to bridge, not published):
  - user_id
  - exact net_pnl
  - mt4_ticket
  - trade_symbol
  - open_price / close_price

Constraint: net_pnl = gross_pnl - commission - swap
```

## Regulatory view keys

Regulators (e.g. FCA, FSCA) receive a **view key** that maps
`user_id_hash` → `user_id` for their jurisdiction. This allows
full audit without exposing data to other parties.

The view key mapping is stored off-chain in a secure, encrypted
compliance database — never on-chain.

## Implementation steps (for contributors)

### Step 1 — Install Stellar Private Payments toolkit
```bash
git clone https://github.com/stellar/stellar-private-payments
cd stellar-private-payments
npm install
npm run demo  # verify local proof generation works
```

### Step 2 — Integrate proof generation into P&L router
See `packages/bridge-core/src/pnl/router.ts` — `TODO (wave:high)` comment.

### Step 3 — Submit proof hash to dual-ledger contract
After proof generation, call `lockProof(proofHash, eventId)` on the
Soroban dual-ledger contract. See `packages/bridge-soroban/src/dual-ledger/`.

### Step 4 — Frontend verification UI
See `packages/bridge-frontend/src/pages/SettlementPage.tsx` — the Verify
button calls Horizon to confirm the proof hash exists on-chain.

## References

- [Stellar Protocol 25 ZK announcement](https://stellar.org/blog/developers/protocol-25-upgrade)
- [Stellar Private Payments repo](https://github.com/stellar/stellar-private-payments)
- [BN254 curve specification](https://neuromancer.sk/std/bn/bn254)
- [Groth16 paper](https://eprint.iacr.org/2016/260.pdf)
