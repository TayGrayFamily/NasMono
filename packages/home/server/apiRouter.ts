import express, {
  Router,
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import { createDockerSource } from './createDockerSource.js';
import type { DockerSource } from './types.js';

// Assuming game-server db functions are available via import.
// The actual path might need adjustment based on build output.
// Using '.js' extension assuming compiled JS files are imported.
// If running with ts-node or similar, the path might remain '.ts'.
// For broader compatibility, we'll assume '.js' for the compiled output.
import { findOrCreateUser } from '../../game-server/db.js'; // <-- Import added

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

  /** Server-side HTTP check (avoids browser CORS on cross-port homelab URLs). */
  r.get('/reachability', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const raw = req.query.target;
      const targetStr = Array.isArray(raw) ? raw[0] : raw;
      if (typeof targetStr !== 'string' || !targetStr.trim()) {
        res.status(400).json({ ok: false, error: 'missing target' });
        return;
      }
      if (targetStr.length > 2048) {
        res.status(400).json({ ok: false, error: 'target too long' });
        return;
      }
      let u: URL;
      try {
        u = new URL(targetStr);
      } catch {
        res.status(400).json({ ok: false, error: 'invalid url' });
        return;
      }
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        res.status(400).json({ ok: false, error: 'only http(s) allowed' });
        return;
      }
      if (u.username !== '' || u.password !== '') {
        res.status(400).json({ ok: false, error: 'credentials in url not allowed' });
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const resp = await fetch(u.href, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers: { 'User-Agent': 'NasMono-Reachability/1.0' },
        });
        clearTimeout(timeout);
        const status = resp.status;
        // Anything that completes TCP+HTTP without 5xx counts as "there" (incl. 401/403/404).
        const ok = status > 0 && status < 500;
        res.json({ ok, status });
      } catch {
        clearTimeout(timeout);
        res.json({ ok: false, status: 0 });
      }
    } catch (err) {
      next(err);
    }
  });

  // New endpoint for login/signup
  r.post('/api/auth/login_or_signup', async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({ ok: false, error: 'Username is required.' });
    }

    try {
      // Ensure we are calling the correctly imported function
      const user = await findOrCreateUser(username.trim());
      // In a real app, you'd generate a JWT or session token here.
      // For now, just return the user details.
      res.json({ ok: true, user });
    } catch (err) {
      console.error('Error during login or signup:', err);
      next(err); // Pass to the error handler
    }
  });

  r.use((err: unknown, _req: Request, res: Response) => {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: message });
  });

  return r;
}

/** Sub-app so Connect/Vite gets Express-patched `req`/`res` (`res.status`, `res.json`, …). */
export function createApiApp(): Express {
  const app = express();
  // Add body parsing middleware to handle JSON request bodies
  app.use(express.json());
  app.use(createApiRouter());
  return app;
}
