import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDbClient, dbStatus } from './src/db/index.js';
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

export async function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

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
    res.json({ ok: true, db: dbStatus });
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
  const { setupDatabase } = await import('./src/db/index.js');
  await setupDatabase();

  const { httpServer } = await createApp();
  const PORT = Number(process.env.GAME_SERVER_PORT || 3001);
  const HOST = process.env.SERVER_HOST || '0.0.0.0';

  httpServer
    .listen(PORT, HOST, () => console.log(`Server running on http://${HOST}:${PORT}`))
    .on('error', (err: Error) => {
      if ('code' in err && (err as any).code === 'EADDRNOTAVAIL') {
        console.warn(`Could not bind to ${HOST}, falling back to 0.0.0.0`);
        httpServer.listen(PORT, '0.0.0.0', () =>
          console.log(`Server running on http://0.0.0.0:${PORT}`),
        );
      } else {
        throw err;
      }
    });

  process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
  process.on('unhandledRejection', (err) => console.error('Unhandled Rejection:', err));
}

if (process.env.NODE_ENV !== 'test') {
  initializeServer().catch(console.error);
}
