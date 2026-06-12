import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger, LumexError } from '@lumex/shared';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) {
    return next(new LumexError('Missing Authorization header', 'UNAUTHORIZED', 401));
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as Request & { caller: unknown }).caller = payload;
    next();
  } catch {
    next(new LumexError('Invalid token', 'UNAUTHORIZED', 401));
  }
}

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  logger.info(`[${req.method}] ${req.path}`);
  next();
}
