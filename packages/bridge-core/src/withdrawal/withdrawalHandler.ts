import { Router, Request, Response, NextFunction } from 'express';
import { logger, MULTISIG_THRESHOLD_USD, WithdrawalError } from '@lumex/shared';
import Decimal from 'decimal.js';

export const withdrawalRouter = Router();

/**
 * POST /withdrawal/request
 *
 * Initiates a withdrawal from MT4 balance to user's bank account.
 *
 * Flow:
 *   1. Verify user KYC tier and balance
 *   2. If amount > MULTISIG_THRESHOLD_USD, gate behind multi-sig approval
 *   3. Call Anchor Platform SEP-6 withdraw endpoint
 *   4. Debit MT4 account
 *   5. Record in dual ledger
 *
 * TODO (wave:high): Implement full withdrawal flow end-to-end.
 * TODO (wave:high): Implement multi-sig gate — store pending approval, notify
 *   second and third signers, and only proceed when threshold met.
 * TODO (wave:medium): Add withdrawal status polling endpoint.
 */
withdrawalRouter.post('/request', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, amount, asset, bankDetails } = req.body;

    const withdrawalAmount = new Decimal(amount);
    logger.info('[withdrawal] Request received', { userId, amount, asset });

    if (withdrawalAmount.lte(0)) {
      throw new WithdrawalError('Withdrawal amount must be positive');
    }

    // Multi-sig gate for large withdrawals
    if (withdrawalAmount.gte(MULTISIG_THRESHOLD_USD)) {
      logger.info('[withdrawal] Amount exceeds threshold, queuing for multi-sig', {
        amount,
        threshold: MULTISIG_THRESHOLD_USD,
      });
      // TODO (wave:high): Queue for multi-sig approval
      return res.json({ status: 'MULTISIG_PENDING', message: 'Withdrawal queued for approval' });
    }

    // TODO: call Anchor Platform SEP-6 withdraw
    // TODO: debit MT4 account
    // TODO: record in dual ledger

    res.json({ status: 'ANCHOR_SUBMITTED', withdrawalId: `wdl-stub-${Date.now()}` });
  } catch (err) {
    next(err);
  }
});

export async function initiateWithdrawal(params: {
  userId: string;
  amount: string;
  asset: string;
}): Promise<void> {
  // Internal call from P&L engine for automatic settlement
  // TODO (wave:high): Implement
  void params;
}
