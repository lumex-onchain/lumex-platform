import { Request, Response, NextFunction } from 'express';
import { LumexError, logger } from '@lumex/shared';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof LumexError) {
    logger.warn('[bridge-core] Error', { code: err.code, message: err.message });
    return res.status(err.statusCode).json({ error: err.code, message: err.message });
  }
  logger.error('[bridge-core] Unhandled error', { err });
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Unexpected error' });
}
