import express, {
  Router,
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import { createDockerSource } from './createDockerSource.js';
import { loadMergedLaunchPadApps } from './launchpadConfig.js';
import { mergeLaunchpadWithContainers } from './mergeLaunchpadApps.js';
import { fetchAdminOverview } from './adminOverview.js';
import { isAdminActionsEnabled, getStackUpdateContainerMatch } from './adminActionsConfig.js';
import {
  refreshDockerDigests,
  updateAllOutdatedContainers,
  updateContainer,
  updateContainers,
} from './unraidDockerActions.js';
import { buildTempAnalytics } from './tempAnalytics.js';
import { buildMetricsAnalytics } from './metricsAnalytics.js';
import { METRICS_WINDOW_MS, parseMetricsWindow } from './metricsHistory.js';
import { TEMP_WINDOW_MS, parseTempWindow } from './tempHistory.js';
import { startTempSampler } from './tempSampler.js';
import { probeReachability } from './reachability.js';
import type { DockerSource } from './types.js';

// Assuming game-server db functions are available via import.
// The actual path might need adjustment based on build output.
// Using '.js' extension assuming compiled JS files are imported.
// If running with ts-node or similar, the path might remain '.ts'.
// For broader compatibility, we'll assume '.js' for the compiled output.
// Removed the direct import from game-server to maintain package independence.
// We will interact via HTTP calls instead.

let source: DockerSource | null = null;

function getSource(): DockerSource {
  if (!source) {
    source = createDockerSource();
  }
  return source;
}

/** Clears cached Docker source (integration tests with different env). */
export function resetDockerSourceCache(): void {
  source = null;
}

function requireAdminActions(res: Response): boolean {
  if (!isAdminActionsEnabled()) {
    res.status(403).json({ ok: false, error: 'admin actions disabled' });
    return false;
  }
  return true;
}

function requireUnraidConfigured(res: Response): boolean {
  if (!process.env.UNRAID_GRAPHQL_URL?.trim() || !process.env.UNRAID_API_KEY?.trim()) {
    res.status(503).json({ ok: false, error: 'Unraid GraphQL not configured' });
    return false;
  }
  return true;
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

  r.get('/admin/overview', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const overview = await fetchAdminOverview();
      res.json(overview);
    } catch (err) {
      next(err);
    }
  });

  r.post(
    '/admin/docker/refresh-digests',
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        if (!requireAdminActions(res) || !requireUnraidConfigured(res)) return;
        const result = await refreshDockerDigests();
        res.json({ ok: result.ok, warnings: result.warnings });
      } catch (err) {
        next(err);
      }
    },
  );

  r.post(
    '/admin/docker/containers/:id/update',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!requireAdminActions(res) || !requireUnraidConfigured(res)) return;
        const rawId = req.params.id;
        const id = decodeURIComponent(
          Array.isArray(rawId) ? (rawId[0] ?? '') : (rawId ?? ''),
        ).trim();
        if (!id) {
          res.status(400).json({ ok: false, error: 'missing container id' });
          return;
        }
        const result = await updateContainer(id);
        res.json({ ok: true, container: result.container, warnings: result.warnings });
      } catch (err) {
        next(err);
      }
    },
  );

  r.post(
    '/admin/docker/update-outdated',
    async (_req: Request, res: Response, next: NextFunction) => {
      try {
        if (!requireAdminActions(res) || !requireUnraidConfigured(res)) return;
        const result = await updateAllOutdatedContainers();
        res.json({ ok: true, containers: result.containers, warnings: result.warnings });
      } catch (err) {
        next(err);
      }
    },
  );

  r.post('/admin/docker/update-stack', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      if (!requireAdminActions(res) || !requireUnraidConfigured(res)) return;
      const match = getStackUpdateContainerMatch();
      if (!match) {
        res.status(400).json({ ok: false, error: 'STACK_UPDATE_CONTAINER_MATCH not configured' });
        return;
      }
      const overview = await fetchAdminOverview();
      const ids = overview.containers.items.filter((c) => match.test(c.name)).map((c) => c.id);
      if (ids.length === 0) {
        res.status(404).json({ ok: false, error: 'no matching stack containers found' });
        return;
      }
      const result = await updateContainers(ids);
      res.json({ ok: true, containers: result.containers, warnings: result.warnings });
    } catch (err) {
      next(err);
    }
  });

  r.get('/admin/temperature', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const raw = req.query.window;
      const windowKey = parseTempWindow(Array.isArray(raw) ? raw[0] : raw);
      const windowMs = TEMP_WINDOW_MS[windowKey];
      res.json(buildTempAnalytics(windowKey, windowMs));
    } catch (err) {
      next(err);
    }
  });

  r.get('/admin/metrics', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const raw = req.query.window;
      const windowKey = parseMetricsWindow(Array.isArray(raw) ? raw[0] : raw);
      const windowMs = METRICS_WINDOW_MS[windowKey];
      res.json(buildMetricsAnalytics(windowKey, windowMs));
    } catch (err) {
      next(err);
    }
  });

  r.get('/launchpad', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const apps = loadMergedLaunchPadApps();
      const containers = await getSource().listContainers();
      res.json(mergeLaunchpadWithContainers(apps, containers));
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

      const rawPort = req.query.hostPort;
      const hostPortStr = Array.isArray(rawPort) ? rawPort[0] : rawPort;
      const hostPort =
        typeof hostPortStr === 'string' && hostPortStr.trim() !== ''
          ? Number(hostPortStr)
          : undefined;

      const result = await probeReachability(u, Number.isFinite(hostPort) ? hostPort : undefined);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  // New endpoint for login/signup
  r.post('/auth/login_or_signup', async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({ ok: false, error: 'Username is required.' });
    }

    try {
      // Proxy the request to the game-server
      const gameServerUrl = process.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${gameServerUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username.trim() }),
      });

      const userData: any = await response.json();
      if (!response.ok) {
        throw new Error(userData.error || 'Login failed');
      }

      res.json({ ok: true, user: userData });
    } catch (err) {
      console.error('Error during login or signup proxy:', err);
      next(err);
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
  startTempSampler();
  const app = express();
  // Add body parsing middleware to handle JSON request bodies
  app.use(express.json());
  app.use(createApiRouter());
  return app;
}
