import { Router, Request, Response, NextFunction } from 'express';
import { getPrices } from './getPrices';
import { getQuote } from './getQuote';
import { getQuoteById } from './getQuoteById';

export const sep38Router = Router();

/**
 * GET /sep38/prices
 * Returns indicative exchange rates for all supported sell/buy asset pairs.
 * No authentication required.
 *
 * TODO (wave:medium): Implement real-time price feed caching layer.
 * Currently fetches live rates on every request — add Redis cache with 30s TTL.
 */
sep38Router.get('/prices', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getPrices(req.query as Record<string, string>);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /sep38/quote
 * Returns a firm quote with a short expiry (60 seconds).
 * Called by Anchor Platform before each deposit or withdrawal.
 */
sep38Router.post('/quote', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getQuote(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /sep38/quote/:id
 * Returns a previously created firm quote.
 */
sep38Router.get('/quote/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getQuoteById(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
