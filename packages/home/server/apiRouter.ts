import { Router, type Request, type Response, type NextFunction } from 'express';
import { createDockerSource } from './createDockerSource.js';
import type { DockerSource } from './types.js';

let source: DockerSource | null = null;

function getSource(): DockerSource {
  if (!source) {
    source = createDockerSource();
  }
  return source;
}

export function createApiRouter(): Router {
  const r = Router();

  r.get('/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  r.get('/containers', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const containers = await getSource().listContainers();
      res.json(containers);
    } catch (err) {
      next(err);
    }
  });

  r.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  });

  return r;
}
