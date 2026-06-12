import { Router, Request, Response, NextFunction } from 'express';
import { handleDepositComplete } from './depositHandler';

export const depositRouter = Router();

/**
 * POST /deposit/complete
 *
 * Called by the Anchor Platform (via business-server callback relay)
 * when a deposit reaches 'completed' status — i.e. the bank has confirmed receipt.
 *
 * Flow:
 *   1. Validate and parse the callback payload
 *   2. Resolve userId from Stellar address → user ledger map
 *   3. Lock funds in Soroban escrow contract
 *   4. Credit MT4 account via bridge plugin API
 *   5. Record deposit in dual-ledger (DB + on-chain)
 *   6. Return 200 to Anchor Platform
 *
 * IDEMPOTENCY: This endpoint must be idempotent.
 * Re-delivering the same transaction_id must not double-credit MT4.
 * TODO (wave:high): Implement idempotency guard using transaction_id as unique key.
 */
depositRouter.post('/complete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await handleDepositComplete(req.body);
    res.json({ ok: true, mt4CreditTxId: result.mt4CreditTxId });
  } catch (err) {
    next(err);
  }
});
