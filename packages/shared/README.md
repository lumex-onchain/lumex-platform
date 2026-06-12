<div align="center">

# `@lumex/shared`

### Shared TypeScript types, error classes, constants, and utilities

*The foundation every other Lumex package builds on*

---

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square)](https://www.typescriptlang.org/)
[![Runtime deps](https://img.shields.io/badge/runtime%20deps-winston%20only-lightgrey?style=flat-square)](package.json)

</div>

---

## Overview

`@lumex/shared` is the internal library every other package in the monorepo imports. It contains:

- **TypeScript type definitions** — every domain object: users, deposits, withdrawals, trades, KYC records
- **Custom error classes** — typed errors with HTTP status codes and machine-readable codes
- **Constants** — SEP endpoint paths, MT4 group names, supported assets, threshold values
- **Logger** — Winston-based structured logger, JSON in production, coloured in development

Runtime dependencies are minimal — only `winston` for logging. Everything else is pure TypeScript compiled to JavaScript and declaration files.

---

## Package structure

```
packages/shared/
├── src/
│   ├── index.ts              # Re-exports everything below
│   ├── types/
│   │   ├── user.ts           # LumexUser, KycTier, CorridorCode, KYC_TIER_MT4_GROUP
│   │   ├── deposit.ts        # DepositRecord, DepositStatus, DepositCallbackPayload
│   │   ├── withdrawal.ts     # WithdrawalRecord, TradeEvent, PnLRecord, BankDetails
│   │   ├── trade.ts          # Re-exports TradeEvent and PnLRecord
│   │   └── kyc.ts            # Sep12CustomerFields, Sep12CustomerResponse, KycProviderResult
│   ├── constants.ts          # STELLAR_NETWORK, SUPPORTED_ASSETS, SEP_ENDPOINTS, MT4_GROUPS
│   ├── errors.ts             # LumexError and domain-specific subclasses
│   └── logger.ts             # Winston logger — JSON in prod, coloured in dev
```

---

## Core types

### Users and KYC

```typescript
type KycTier = 'TIER_1' | 'TIER_2' | 'TIER_3';

interface LumexUser {
  id: string;
  stellarAddress: string;   // 56-character Stellar G-address
  mt4AccountId: string;     // MetaApi / bridge plugin account ID
  kycTier: KycTier;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  corridor: CorridorCode;   // 'NGN' | 'KES' | 'GHS' | 'ZAR' | 'BRL' | 'USD' | 'EUR'
  createdAt: Date;
  updatedAt: Date;
}

// MT4 account group assigned per KYC tier
const KYC_TIER_MT4_GROUP: Record<KycTier, string> = {
  TIER_1: 'retail_micro',     // no leverage, $500 max position
  TIER_2: 'retail_standard',  // up to 1:30 leverage
  TIER_3: 'retail_pro',       // exotic pairs, institutional limits
};
```

### Deposits

```typescript
type DepositStatus =
  | 'INITIATED'
  | 'KYC_PENDING'
  | 'AWAITING_BANK'
  | 'ESCROW_LOCKED'
  | 'MT4_CREDITED'
  | 'COMPLETE'
  | 'FAILED';

interface DepositRecord {
  id: string;
  userId: string;
  anchorTransactionId: string;  // unique — serves as idempotency key
  stellarTxHash?: string;
  amount: string;               // decimal string: "100.00"
  asset: string;                // "USDC" | "MGUSD" | "EURC"
  corridor: string;
  status: DepositStatus;
  mt4CreditTxId?: string;
  sorobanEscrowTxHash?: string;
  bankConfirmationRef?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Shape of callback from Stellar Anchor Platform
interface DepositCallbackPayload {
  transaction_id: string;
  stellar_transaction_id?: string;
  kind: 'deposit';
  status: 'completed' | 'pending_external' | 'error';
  amount_in: string;
  amount_out: string;
  amount_fee: string;
  asset_code: string;
  to: string;   // user's Stellar G-address
  started_at: string;
  completed_at?: string;
}
```

### Trades and P&L

```typescript
// Shape of event sent by MT4 bridge plugin on trade close
interface TradeEvent {
  mt4AccountId: string;
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  closePrice: number;
  openTime: string;
  closeTime: string;
  profit: number;       // gross profit in account currency (USD)
  commission: number;
  swap: number;
  comment?: string;
}

interface PnLRecord {
  id: string;
  userId: string;
  mt4Ticket: number;
  grossPnl: string;
  commission: string;
  swap: string;
  netPnl: string;       // grossPnl - |commission| - |swap|
  settledAt?: Date;
  zkProofHash?: string; // Protocol 25 ZK proof hash
  createdAt: Date;
}
```

### KYC (SEP-12)

```typescript
interface Sep12CustomerFields {
  first_name?: string;
  last_name?: string;
  email_address?: string;
  phone_number?: string;
  country_code?: string;
  id_type?: 'drivers_license' | 'passport' | 'national_id';
  id_number?: string;
  photo_id_front?: Buffer;
  photo_id_back?: Buffer;
}

interface Sep12CustomerResponse {
  id: string;
  status: 'ACCEPTED' | 'PROCESSING' | 'NEEDS_INFO' | 'REJECTED';
  fields?: Record<string, { description: string; type: string; optional?: boolean }>;
  message?: string;
}

interface KycProviderResult {
  externalId: string;
  status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR';
  tier: KycTier;
  rejectionReason?: string;
  completedAt?: Date;
}
```

---

## Error classes

All errors extend `LumexError`, which carries an HTTP status code and a machine-readable error code — consistent error handling across the entire codebase.

```typescript
class LumexError extends Error {
  constructor(message: string, code: string, statusCode: number = 500)
}

class KycError extends LumexError         // 403 — KYC_ERROR
class DepositError extends LumexError     // 400 — DEPOSIT_ERROR
class WithdrawalError extends LumexError  // 400 — WITHDRAWAL_ERROR
class Mt4Error extends LumexError         // 502 — MT4_ERROR
class MultisigError extends LumexError    // 403 — MULTISIG_ERROR
```

**Usage:**

```typescript
import { DepositError, Mt4Error, LumexError } from '@lumex/shared';

if (amount.lte(0)) {
  throw new DepositError('Deposit amount must be positive');
}

// In errorHandler middleware:
if (err instanceof LumexError) {
  res.status(err.statusCode).json({ error: err.code, message: err.message });
}
```

---

## Constants

```typescript
// Stellar network passphrases
STELLAR_NETWORK.TESTNET  // "Test SDF Network ; September 2015"
STELLAR_NETWORK.MAINNET  // "Public Global Stellar Network ; September 2015"

// Supported deposit assets
SUPPORTED_ASSETS  // readonly ['USDC', 'EURC', 'MGUSD']

// Withdrawal multi-sig threshold (USD)
MULTISIG_THRESHOLD_USD  // 10_000

// SEP endpoint paths (relative to Anchor Platform base URL)
SEP_ENDPOINTS.DEPOSIT     // '/sep6/deposit'
SEP_ENDPOINTS.WITHDRAW    // '/sep6/withdraw'
SEP_ENDPOINTS.TRANSACTION // '/sep6/transaction'
SEP_ENDPOINTS.CUSTOMER    // '/sep12/customer'
SEP_ENDPOINTS.QUOTE       // '/sep38/quote'
SEP_ENDPOINTS.PRICES      // '/sep38/prices'

// MT4 account groups
MT4_GROUPS.MICRO          // 'retail_micro'
MT4_GROUPS.STANDARD       // 'retail_standard'
MT4_GROUPS.PRO            // 'retail_pro'

// Deposit and escrow timing
DEPOSIT_EXPIRY_MINUTES         // 60
ESCROW_GRACE_PERIOD_LEDGERS    // 100  (~500 seconds on Stellar)
```

---

## Logger

The shared logger automatically switches output format based on `NODE_ENV`:

```typescript
import { logger } from '@lumex/shared';

logger.info('[deposit] Processing deposit', { transactionId, amount });
logger.warn('[aml] High-risk address flagged', { address, riskLevel });
logger.error('[mt4] Credit failed', { mt4AccountId, error });
```

- **Development** (`NODE_ENV !== 'production'`) — coloured, human-readable console output
- **Production** (`NODE_ENV === 'production'`) — structured JSON, compatible with Datadog, CloudWatch, or any log aggregator

Log level is controlled via `LOG_LEVEL` (default: `info`).

---

## Usage in other packages

All packages are npm workspace siblings — `@lumex/shared` is referenced by `*`, no version pinning needed:

```json
// In any package's package.json
{
  "dependencies": {
    "@lumex/shared": "*"
  }
}
```

```typescript
// In any TypeScript source file
import { LumexUser, DepositRecord, logger, DepositError } from '@lumex/shared';
```

---

## Building

```bash
# From the repo root — build shared first, before any other package
npm run build -w packages/shared

# Or from this directory
cd packages/shared
npm run build
```

Output goes to `dist/`:
- `dist/index.js` — CommonJS output
- `dist/index.d.ts` — TypeScript declaration files
- `dist/index.d.ts.map` — source maps for IDE navigation

---

## Contributing

This package currently has no open Wave issues — it is foundational and changes here ripple across every package. If you find a missing type or constant while working on another package's Wave issue, add it here as part of that PR rather than opening a separate issue.
