import { Router, Request, Response, NextFunction } from 'express';
import { TradeEvent, logger } from '@lumex/shared';
import Decimal from 'decimal.js';
import { resolveLedgerEntry } from '../ledger/ledgerMap';
import { recordPnL } from '../ledger/dualLedger';
import { initiateWithdrawal } from '../withdrawal/withdrawalHandler';

export const tradeEventRouter = Router();

/**
 * POST /trade/event
 *
 * Receives trade close events from the MT4 bridge plugin (Takeprofit/Fortex/Brokeree).
 * Calculates net P&L, records to dual ledger, and triggers settlement if withdrawal requested.
 *
 * TODO (wave:high): Implement ZK proof generation for P&L settlement.
 *   After netPnL is calculated, generate a Groth16 proof using the Stellar Private Payments
 *   toolkit and submit the proof hash to the Soroban dual-ledger contract.
 *   See: https://github.com/stellar/stellar-private-payments
 *
 * TODO (wave:medium): Add trade event deduplication by MT4 ticket number.
 * TODO (wave:medium): Implement real-time P&L streaming via WebSocket to frontend.
 */
tradeEventRouter.post('/event', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = req.body as TradeEvent;
    logger.info('[pnl] Trade event received', { ticket: event.ticket, profit: event.profit });

    // Resolve user from MT4 account ID
    const ledgerEntry = await resolveLedgerEntryByMt4(event.mt4AccountId);
    if (!ledgerEntry) {
      logger.warn('[pnl] Unknown MT4 account', { mt4AccountId: event.mt4AccountId });
      return res.status(200).json({ received: true, processed: false });
    }

    const gross = new Decimal(event.profit);
    const commission = new Decimal(event.commission);
    const swap = new Decimal(event.swap);
    const net = gross.minus(commission.abs()).minus(swap.abs());

    logger.info('[pnl] Net P&L calculated', {
      gross: gross.toString(),
      commission: commission.toString(),
      swap: swap.toString(),
      net: net.toString(),
    });

    // Record P&L in dual ledger
    await recordPnL({
      userId: ledgerEntry.userId,
      mt4Ticket: event.ticket,
      grossPnl: gross.toString(),
      commission: commission.toString(),
      swap: swap.toString(),
      netPnl: net.toString(),
    });

    res.json({ ok: true, netPnl: net.toString() });
  } catch (err) {
    next(err);
  }
});

async function resolveLedgerEntryByMt4(mt4AccountId: string) {
  // TODO (wave:medium): Implement reverse lookup (MT4 account ID → user)
  void mt4AccountId;
  return null;
}
