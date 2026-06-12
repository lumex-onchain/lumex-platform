import { Router, Request, Response, NextFunction } from 'express';
import { getCustomer } from './getCustomer';
import { putCustomer } from './putCustomer';
import { deleteCustomer } from './deleteCustomer';

export const sep12Router = Router();

/**
 * GET /sep12/customer
 * Called by Anchor Platform to fetch KYC status for a user.
 * Returns required fields based on current KYC tier.
 */
sep12Router.get('/customer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getCustomer(req.query as Record<string, string>);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /sep12/customer
 * Called by Anchor Platform to submit KYC fields for a user.
 * Proxies to KYC provider (Sumsub/Onfido) and updates tier.
 */
sep12Router.put('/customer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await putCustomer(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /sep12/customer
 * GDPR erasure request — removes PII, retains anonymised audit record.
 */
sep12Router.delete('/customer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteCustomer(req.query as Record<string, string>);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
