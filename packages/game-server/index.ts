import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getDbClient,
  setupDatabase,
  dbStatus,
  dbConnectionError,
  isDatabaseConfigured,
  isDatabaseReady,
} from './src/db/index.js';
import { LobbyService } from './src/services/LobbyService.js';
import { UserService } from './src/services/UserService.js';
import { SocketService } from './src/services/SocketService.js';
import { createLobbyRouter } from './src/routes/lobbyRouter.js';
import { createUserRouter } from './src/routes/userRouter.js';
import { createAdminRouter } from './src/routes/adminRouter.js';
import { isAdminEnabled, requireAdminEnabled } from './src/middleware/adminGuard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function logEvent(level: 'info' | 'warn' | 'error', msg: string, extra?: Record<string, unknown>) {
  console.log(JSON.stringify({ level, service: 'game-server', msg, ...extra }));
}

export async function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      logEvent('info', 'request', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        ms: Date.now() - start,
      });
    });
    next();
  });

  // --- Services ---
  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: '*' } });

  const lobbyService = new LobbyService();
  const userService = new UserService();
  const socketService = new SocketService(io);

  socketService.initialize();

  // --- Routes ---

  // Static Admin GUI (env-gated)
  if (isAdminEnabled()) {
    app.use('/admin', requireAdminEnabled, express.static(path.join(__dirname, 'admin')));
  } else {
    app.use('/admin', (_req, res) => res.status(404).json({ error: 'Not found' }));
  }

  // API Routers
  const apiRouter = express.Router();
  apiRouter.get('/health', (_req, res) => {
    const dbRequired = isDatabaseConfigured();
    const ok = !dbRequired || isDatabaseReady();
    res.status(ok ? 200 : 503).json({
      ok,
      db: dbStatus,
      ...(dbConnectionError ? { error: dbConnectionError } : {}),
    });
  });
  apiRouter.use('/lobbies', createLobbyRouter(lobbyService, socketService));
  apiRouter.use('/admin', requireAdminEnabled, createAdminRouter(socketService));
  apiRouter.use('/', createUserRouter(userService)); // login and users/:id

  app.use('/api', apiRouter);

  // --- Global Debug Endpoint (env-gated) ---
  app.get('/debug', requireAdminEnabled, async (_req, res) => {
    let lobbies: any[] = [];
    let persistedUsers: any[] = [];
    let dbStatusError: string | null = null;

    try {
      const client = await getDbClient();
      try {
        const result = await client.query('SELECT * FROM lobbies');
        lobbies = result.rows;
      } catch (e) {
        console.error('Error fetching lobbies for debug:', e);
      }

      try {
        const result = await client.query('SELECT * FROM users');
        persistedUsers = result.rows;
      } catch (e) {
        console.error('Error fetching users for debug:', e);
      }
      client.release();
    } catch (e) {
      dbStatusError = e instanceof Error ? e.message : String(e);
    }

    const socketState = socketService.getDebugState();

    res.json({
      status: {
        uptime: process.uptime(),
        socketClients: io.engine.clientsCount,
        dbError: dbStatusError,
      },
      state: {
        ephemeralState: socketState,
        persistentState: {
          activeLobbies: lobbies,
          persistedUsers: persistedUsers,
        },
      },
    });
  });

  return { app, httpServer, io, socketService };
}

export async function initializeServer() {
  if (isDatabaseConfigured()) {
    await setupDatabase();
  }

  if (process.env.NODE_ENV === 'production' && isDatabaseConfigured() && !isDatabaseReady()) {
    logEvent('error', 'database not ready — exiting', {
      db: dbStatus,
      error: dbConnectionError,
    });
    process.exit(1);
  }

  const { httpServer } = await createApp();
  const PORT = Number(process.env.GAME_SERVER_PORT || 3001);
  const HOST = process.env.SERVER_HOST || '0.0.0.0';

  httpServer
    .listen(PORT, HOST, () => {
      logEvent('info', 'listening', { port: PORT, host: HOST, db: dbStatus });
    })
    .on('error', (err: Error) => {
      if ('code' in err && (err as any).code === 'EADDRNOTAVAIL') {
        logEvent('warn', 'bind failed, falling back to 0.0.0.0', { host: HOST });
        httpServer.listen(PORT, '0.0.0.0', () => {
          logEvent('info', 'listening', { port: PORT, host: '0.0.0.0', db: dbStatus });
        });
      } else {
        throw err;
      }
    });

  process.on('uncaughtException', (err) =>
    logEvent('error', 'uncaughtException', { error: String(err) }),
  );
  process.on('unhandledRejection', (err) =>
    logEvent('error', 'unhandledRejection', { error: String(err) }),
  );
}

if (process.env.NODE_ENV !== 'test') {
  initializeServer().catch((err) => {
    logEvent('error', 'startup failed', { error: String(err) });
    process.exit(1);
  });
}
