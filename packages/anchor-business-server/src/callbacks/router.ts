import { Router, Request, Response, NextFunction } from 'express';
import { logger } from '@lumex/shared';

export const callbackRouter = Router();

/**
 * POST /callbacks/deposit
 * Called by Stellar Anchor Platform when a deposit reaches 'completed' status.
 * This triggers the Soroban escrow lock and MT4 provisional credit.
 *
 * NOTE: This callback is the entry point for the core deposit flow.
 * The bridge-core package handles the actual MT4 credit logic.
 */
callbackRouter.post('/deposit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('[callbacks] deposit callback received', { txId: req.body?.transaction_id });

    // Forward to bridge-core via internal HTTP or direct import
    // TODO (wave:medium): Implement bridge-core deposit handler call
    // await bridgeCore.handleDepositComplete(req.body);

    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /callbacks/withdraw
 * Called by Stellar Anchor Platform when a withdrawal is authorised.
 *
 * TODO (wave:medium): Implement withdrawal confirmation flow.
 */
callbackRouter.post('/withdraw', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('[callbacks] withdraw callback received', { txId: req.body?.transaction_id });
    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
});
