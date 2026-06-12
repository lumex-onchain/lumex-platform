import Decimal from 'decimal.js';
import { DepositCallbackPayload, DepositError, logger } from '@lumex/shared';
import { resolveLedgerEntry } from '../ledger/ledgerMap';
import { lockEscrow } from '../soroban/escrowClient';
import { creditMt4Account } from '../mt4/mt4Client';
import { recordDeposit } from '../ledger/dualLedger';

export interface DepositResult {
  mt4CreditTxId: string;
  escrowTxHash: string;
}

/**
 * Core deposit handler — called when Anchor Platform confirms bank receipt.
 *
 * This is the most critical function in Lumex. Any bugs here risk double-crediting
 * or missed credits. All steps must be atomic where possible and idempotent.
 *
 * TODO (wave:high): Implement full idempotency — check deposit record by
 *   anchorTransactionId before proceeding. If already processed, return existing result.
 *
 * TODO (wave:high): Add retry logic with exponential backoff for MT4 credit step.
 *   If MT4 credit fails after escrow lock, the escrow must be reversed or held.
 *   Use bull queue for reliable async processing with dead-letter queue.
 *
 * TODO (wave:medium): Emit structured event to Kafka/Redis pub-sub so frontend
 *   can show real-time deposit status updates.
 */
export async function handleDepositComplete(
  payload: DepositCallbackPayload,
): Promise<DepositResult> {
  const { transaction_id, stellar_transaction_id, amount_out, asset_code, to } = payload;

  logger.info('[deposit] Processing deposit complete', { transaction_id, amount_out, asset_code });

  if (!amount_out || !to) {
    throw new DepositError('Missing required fields: amount_out, to');
  }

  const amount = new Decimal(amount_out);
  if (amount.lte(0)) {
    throw new DepositError(`Invalid deposit amount: ${amount_out}`);
  }

  // 1. Resolve MT4 account from Stellar address
  const ledgerEntry = await resolveLedgerEntry(to);
  if (!ledgerEntry) {
    throw new DepositError(`No ledger entry for Stellar address: ${to}`);
  }

  // 2. Lock Soroban escrow (provisional credit — allows trading before bank clears)
  logger.info('[deposit] Locking Soroban escrow', { userId: ledgerEntry.userId });
  const escrowResult = await lockEscrow({
    userId: ledgerEntry.userId,
    amount: amount.toString(),
    asset: asset_code,
    anchorTxId: transaction_id,
  });

  // 3. Credit MT4 account
  logger.info('[deposit] Crediting MT4 account', { mt4AccountId: ledgerEntry.mt4AccountId });
  const mt4Result = await creditMt4Account({
    mt4AccountId: ledgerEntry.mt4AccountId,
    amount: amount.toNumber(),
    comment: `LUMEX_DEP_${transaction_id.slice(0, 8)}`,
  });

  // 4. Record in dual ledger (PostgreSQL + on-chain reference)
  await recordDeposit({
    userId: ledgerEntry.userId,
    anchorTransactionId: transaction_id,
    stellarTxHash: stellar_transaction_id,
    amount: amount.toString(),
    asset: asset_code,
    mt4CreditTxId: mt4Result.txId,
    sorobanEscrowTxHash: escrowResult.txHash,
    status: 'COMPLETE',
  });

  logger.info('[deposit] Deposit complete', {
    userId: ledgerEntry.userId,
    mt4CreditTxId: mt4Result.txId,
  });

  return {
    mt4CreditTxId: mt4Result.txId,
    escrowTxHash: escrowResult.txHash,
  };
}
