<div align="center">

# `@lumex/corridor-configs`

### Fiat corridor definitions for Lumex

*NGN · KES · GHS · ZAR · BRL — and growing*

---

[![Wave Issues](https://img.shields.io/badge/Wave%20Issues-3%20open-brightgreen?style=flat-square)](https://github.com/lumex-phantom/lumex/issues?q=label%3Apackage%3Acorridor+is%3Aopen)
[![Wave Points](https://img.shields.io/badge/Wave%20Points-300%20available-gold?style=flat-square)](https://github.com/lumex-phantom/lumex/issues?q=label%3Apackage%3Acorridor)
[![JSON Schema](https://img.shields.io/badge/JSON%20Schema-validated-blue?style=flat-square)](schemas/corridor.schema.json)

</div>

---

## Overview

A **corridor** in Lumex is the complete configuration for a fiat currency market: which Stellar assets are accepted, which banking partner handles fiat settlement, deposit/withdrawal limits, and applicable fees.

Corridors are JSON files — one directory per currency code — validated against a strict JSON Schema in CI. If your config validates, it works in the system. This makes corridor contributions the most accessible entry point in Lumex: **no TypeScript or Rust knowledge required**, just well-researched JSON and a clear README explaining the local regulatory landscape.

---

## Package structure

```
packages/corridor-configs/
├── corridors/
│   ├── NGN/                      # Nigeria — largest SSA retail forex market
│   │   └── config.json
│   ├── KES/                      # Kenya — mobile money integration opportunity
│   │   └── config.json
│   ├── GHS/                      # Ghana — high FX demand, cedi devaluation pressure
│   │   └── config.json
│   ├── ZAR/                      # South Africa — most mature SSA regulatory framework
│   │   └── config.json
│   └── BRL/                      # Brazil — largest LatAm market, PIX instant rails
│       └── config.json
├── schemas/
│   └── corridor.schema.json      # JSON Schema — all configs validated against this
└── scripts/
    └── validate-corridors.js     # Validation script run by CI
```

---

## Corridor config schema

Every `config.json` must conform to `schemas/corridor.schema.json`:

```jsonc
{
  "code": "NGN",                  // ISO 4217 currency code (3 uppercase letters)
  "name": "Nigeria",               // Human-readable country name
  "currency": "NGN",
  "assets": [                      // Stellar assets accepted in this corridor
    {
      "assetCode": "USDC",
      "issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
      "decimals": 7,
      "notes": "Circle USDC — primary deposit asset"
    }
  ],
  "bankingPartner": {
    "name": "Name of licensed banking partner",
    "apiEndpoint": "https://api.banking-partner.example/",
    "settlementMethod": "local",  // "wire" | "local" | "mobile_money" | "instant"
    "notes": "Implementation notes for contributors"
  },
  "limits": {
    "minDepositUsd": 10,
    "maxDepositUsd": 10000,
    "dailyLimitUsd": 50000
  },
  "feeStructure": {
    "depositFeePct": 0.5,
    "withdrawalFeePct": 0.75,
    "minFeeUsd": 1.0
  },
  "mgusdEnabled": true,            // whether MoneyGram MGUSD is accepted
  "regulatoryNotes": "...",
  "status": "planned"              // "active" | "testnet" | "planned"
}
```

---

## Current corridors

### 🇳🇬 NGN — Nigeria
**Status:** Planned · **MGUSD:** ✓ Enabled · **Settlement:** Local bank (PSSP)

Nigeria is the largest retail forex market in sub-Saharan Africa. Persistent USD scarcity, foreign exchange controls, and large diaspora remittance flows create strong demand for transparent, low-cost USD access. MoneyGram's MGUSD stablecoin (launched on Stellar June 2026) opens a direct on-ramp that bypasses slow correspondent banking entirely.

Regulatory requirement: partnership with a CBN-licensed Payment Service Solution Provider (PSSP) — Paystack, Flutterwave, or Grey Finance are leading candidates.

### 🇰🇪 KES — Kenya
**Status:** Planned · **MGUSD:** ✓ Enabled · **Settlement:** Mobile money

Kenya has existing Stellar anchor infrastructure (see the SDF anchor directory) and a mature mobile money ecosystem via M-Pesa. MoneyGram's agent network is strong here, making MGUSD an immediately useful on-ramp. Target integration: M-Pesa Daraja API for KES settlement.

Regulatory requirement: partnership with a CBK-licensed forex bureau or bank.

### 🇬🇭 GHS — Ghana
**Status:** Planned · **MGUSD:** ✗ · **Settlement:** Local bank

Ghana's cedi has experienced sustained devaluation, driving strong retail demand for USD-denominated accounts. MTN Mobile Money (MoMo) integration could enable instant GHS settlement alongside bank rails.

Regulatory requirement: Bank of Ghana (BoG) licensed forex bureau with API access.

### 🇿🇦 ZAR — South Africa
**Status:** Testnet · **MGUSD:** ✗ · **Settlement:** Local bank

South Africa has the most mature regulatory framework for this product type in sub-Saharan Africa. The TD Markets / ZARC Coin precedent demonstrates a SARB-licensed broker can issue Stellar-native fiat assets and operate legally — which is why ZAR is the first corridor on testnet.

Regulatory requirement: SARB (South African Reserve Bank) forex dealer licence and FSCA registration.

### 🇧🇷 BRL — Brazil
**Status:** Planned · **MGUSD:** ✗ · **Settlement:** PIX instant

Brazil's PIX instant payment system (launched 2020) enables real-time BRL settlement 24/7. Integrating PIX would give Lumex same-second withdrawal capability — faster than any other corridor. Brazil also has one of the most active retail forex communities in Latin America.

Regulatory requirement: Banco Central do Brasil (BCB) licensed institution with Open Finance Brazil API access.

---

## Adding a new corridor

This is one of the best first contributions to Lumex. Full process:

### 1. Research the market

Before writing any code, understand:
- Which regulator oversees forex brokers in this country?
- Which banking partners or EMIs have API access and are licensed for forex?
- Does Stellar already have anchor infrastructure for this currency? (Check the [SDF anchor directory](https://resources.stellar.org/anchors))
- Is MoneyGram active here? (Relevant for MGUSD on-ramp eligibility)

### 2. Create the corridor directory

```bash
mkdir packages/corridor-configs/corridors/XOF
touch packages/corridor-configs/corridors/XOF/config.json
touch packages/corridor-configs/corridors/XOF/README.md
```

### 3. Write the config

Use an existing corridor as a template. Use real values — do not guess at banking partner endpoints or invent regulatory citations.

```json
{
  "code": "XOF",
  "name": "Francophone West Africa (CFA Franc)",
  "currency": "XOF",
  "assets": [
    { "assetCode": "USDC", "issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN", "decimals": 7 }
  ],
  "bankingPartner": {
    "name": "Wave Mobile Money (Côte d'Ivoire / Senegal)",
    "apiEndpoint": "https://api.wave.com/v1/",
    "settlementMethod": "mobile_money",
    "notes": "Wave covers CI, SN, ML, BF. Orange Money is a backup option."
  },
  "limits": { "minDepositUsd": 5, "maxDepositUsd": 5000, "dailyLimitUsd": 25000 },
  "feeStructure": { "depositFeePct": 0.6, "withdrawalFeePct": 0.85, "minFeeUsd": 1.0 },
  "mgusdEnabled": false,
  "regulatoryNotes": "BCEAO (Banque Centrale des États de l'Afrique de l'Ouest) regulates payment services across the WAEMU zone.",
  "status": "planned"
}
```

### 4. Write the corridor README

Cover:
- Why this corridor matters (market size, FX demand, user pain points)
- Specific banking partner(s) considered and their API maturity
- Regulatory requirements and how Lumex would comply
- Unique technical considerations (e.g. PIX for Brazil, mobile money for KES/XOF)

### 5. Validate and open a PR

```bash
npm run validate -w packages/corridor-configs
# ✓  NGN  ✓  KES  ✓  GHS  ✓  ZAR  ✓  BRL  ✓  XOF
# 6 passed, 0 failed
```

Open a PR with label `package:corridor`. If it's a Wave issue, also add `wave:trivial` or `wave:medium`.

---

## Validation

CI runs `npm run validate -w packages/corridor-configs` on every PR. The script:

1. Loads `schemas/corridor.schema.json`
2. Finds all `corridors/*/config.json`
3. Validates each against the schema with AJV
4. Exits 1 if any corridor fails

```bash
npm run validate -w packages/corridor-configs
#   ✓  NGN
#   ✓  KES
#   ✓  GHS
#   ✓  ZAR
#   ✓  BRL
#
# 5 passed, 0 failed
```

---

## Open Wave issues

| # | Title | Complexity | Points |
|---|---|---|---|
| [#25](https://github.com/lumex-phantom/lumex/issues/25) | Add XOF (CFA Franc) corridor config — Francophone West Africa | 🟢 Trivial | 100 pts |
| [#26](https://github.com/lumex-phantom/lumex/issues/26) | KES banking partner research and M-Pesa integration notes | 🟡 Medium | 150 pts |
| [#27](https://github.com/lumex-phantom/lumex/issues/27) | Update MGUSD issuer address in NGN and KES configs | 🟢 Trivial | 100 pts |

Issues #25 and #27 are labelled `good-first-issue` — ideal starting points for contributors new to Lumex or to open source in general.

**To propose a new corridor not listed:** open a feature request with label `package:corridor`. Include the target currency, regulatory context, and a candidate banking partner. Maintainers will create a Wave bounty if it meets Lumex's launch criteria.

---

## Roadmap corridors

These are on the roadmap but have no open issue yet. Open a feature request if you'd like to propose one:

| Code | Country | Priority |
|---|---|---|
| XOF | Francophone West Africa | High |
| EGP | Egypt | Medium |
| INR | India | Medium |
| PHP | Philippines | Medium |
| MXN | Mexico | Medium |
| ZMW | Zambia | Low |

---

## References

- [Stellar anchor directory](https://resources.stellar.org/anchors)
- [SDF Anchor Platform getting started](https://developers.stellar.org/docs/anchoring-assets/anchor-platform)
- [MoneyGram MGUSD on Stellar](https://stellar.org/blog/ecosystem/moneygram-launches-mgusd-stablecoin)
- [CBN forex regulations (Nigeria)](https://www.cbn.gov.ng/Regulations/)
- [BCEAO regulatory framework (WAEMU)](https://www.bceao.int/)
- [Banco Central do Brasil — PIX](https://www.bcb.gov.br/estabilidadefinanceira/pix)
