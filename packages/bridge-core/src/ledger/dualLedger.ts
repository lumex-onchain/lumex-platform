import { logger } from '@lumex/shared';
import type { DepositRecord, PnLRecord } from '@lumex/shared';

/**
 * Dual-ledger pattern:
 * All financial events are written to BOTH:
 *   1. PostgreSQL (operational, queryable, fast)
 *   2. Soroban on-chain record (immutable, auditable, tamper-proof)
 *
 * This creates an auditable trail that satisfies both operational needs
 * and regulatory audit requirements (FCA, FINMA, etc.)
 *
 * TODO (wave:high): Implement PostgreSQL writes for all record functions.
 * TODO (wave:high): Implement Soroban dual-ledger contract invocation after each write.
 *   The on-chain record should contain: userId hash, amount, asset, txType, timestamp.
 *   Full PII must NOT go on-chain — only hashed identifiers.
 * TODO (wave:medium): Add reconciliation job to detect DB/on-chain divergence.
 */

export async function recordDeposit(record: Partial<DepositRecord>): Promise<void> {
  logger.info('[dual-ledger] Recording deposit (STUB)', { id: record.anchorTransactionId });
  // TODO: INSERT INTO deposits (...)
  // TODO: Submit on-chain record to Soroban dual-ledger contract
}

export async function recordPnL(record: Partial<PnLRecord>): Promise<void> {
  logger.info('[dual-ledger] Recording P&L (STUB)', { ticket: record.mt4Ticket });
  // TODO: INSERT INTO pnl_records (...)
  // TODO: Submit ZK proof hash to Soroban dual-ledger contract
}

/**
 * User ledger map — maps Stellar address ↔ MT4 account ID ↔ userId
 *
 * TODO (wave:medium): Implement full PostgreSQL-backed ledger map.
 * TODO (wave:trivial): Add index on stellar_address and mt4_account_id columns.
 */
export interface LedgerEntry {
  userId: string;
  stellarAddress: string;
  mt4AccountId: string;
  kycTier: string;
  corridor: string;
}

export async function resolveLedgerEntry(stellarAddress: string): Promise<LedgerEntry | null> {
  // TODO: SELECT * FROM user_ledger_map WHERE stellar_address = $1
  void stellarAddress;
  return null;
}

export async function upsertLedgerEntry(entry: LedgerEntry): Promise<void> {
  // TODO: INSERT INTO user_ledger_map (...) ON CONFLICT (stellar_address) DO UPDATE ...
  void entry;
}
