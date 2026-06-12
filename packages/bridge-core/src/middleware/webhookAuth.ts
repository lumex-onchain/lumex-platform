import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { LumexError } from '@lumex/shared';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? 'dev-webhook-secret';

/**
 * Validates HMAC-SHA256 signature on incoming webhooks from Anchor Platform and MT4 bridge.
 *
 * TODO (wave:medium): Add timestamp validation to prevent replay attacks.
 *   Reject requests where X-Lumex-Timestamp is more than 5 minutes old.
 */
export function webhookAuth(req: Request, _res: Response, next: NextFunction) {
  const signature = req.headers['x-lumex-signature'];
  if (!signature || typeof signature !== 'string') {
    return next(new LumexError('Missing webhook signature', 'UNAUTHORIZED', 401));
  }

  const body = JSON.stringify(req.body);
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return next(new LumexError('Invalid webhook signature', 'UNAUTHORIZED', 401));
  }

  next();
}
