import type { Request, Response, NextFunction } from 'express';
import type { SocketService } from '../services/SocketService.js';

export function createRequireSocketUser(
  socketService: SocketService,
  bodyUserIdFields: string[] = ['userId'],
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const socketId = req.header('X-Socket-Id');
    if (!socketId) {
      return res.status(401).json({ error: 'Socket identification required' });
    }

    const identifiedUserId = socketService.getUserIdForSocket(socketId);
    if (!identifiedUserId) {
      return res.status(401).json({ error: 'Socket not identified. Call set_user first.' });
    }

    for (const field of bodyUserIdFields) {
      const bodyUserId = req.body?.[field];
      if (bodyUserId && bodyUserId !== identifiedUserId) {
        return res.status(403).json({ error: `Mismatched ${field}` });
      }
    }

    req.identifiedUserId = identifiedUserId;
    next();
  };
}
