import type { Request, Response, NextFunction } from 'express';

export function isAdminEnabled(): boolean {
  if (process.env.GAME_SERVER_ENABLE_ADMIN === 'true') return true;
  if (process.env.NODE_ENV === 'development') return true;
  return false;
}

export function requireAdminEnabled(_req: Request, res: Response, next: NextFunction) {
  if (!isAdminEnabled()) {
    return res.status(404).json({ error: 'Not found' });
  }
  next();
}
