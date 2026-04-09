import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDbClient, findOrCreateUser } from './src/db/index.js';
import { LobbyService } from './src/services/LobbyService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export async function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const lobbyService = new LobbyService();
  const apiRouter = express.Router();
  app.use('/api', apiRouter);

  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: '*' } });

  // Map userId -> socketId (for easy lookup)
  const userSocketMap = new Map<string, string>();
  // Map socketId -> userId (for disconnects)
  const socketToUserMap = new Map<string, string>();

  io.on('connection', (socket) => {
    socket.on('set_user', (data: { userId: string }) => {
      if (data.userId) {
        userSocketMap.set(data.userId, socket.id);
        socketToUserMap.set(socket.id, data.userId);
        console.log(`User ${data.userId} connected socket ${socket.id}`);
      }
    });

    socket.on('join_lobby_room', (data: { lobbyId: string; userId: string }) => {
      if (data.lobbyId && data.userId) {
        socket.join(data.lobbyId);
        userSocketMap.set(data.userId, socket.id);
        socketToUserMap.set(socket.id, data.userId);
        console.log(`User ${data.userId} joined lobby ${data.lobbyId}`);
      }
    });

    socket.on('disconnect', async () => {
      const userId = socketToUserMap.get(socket.id);

      // Always remove from maps regardless of DB state to prevent leaks
      socketToUserMap.delete(socket.id);
      if (userId) {
        userSocketMap.delete(userId);
      }

      if (userId) {
        try {
          const client = await getDbClient();
          const res = await client.query('SELECT lobby_id FROM lobby_players WHERE user_id = $1', [
            userId,
          ]);
          if (res.rows.length > 0) {
            const lobbyId = res.rows[0].lobby_id;
            await client.query('DELETE FROM lobby_players WHERE user_id = $1', [userId]);
            io.to(lobbyId).emit('player_left', { userId });
          }
          client.release();
        } catch (e) {
          console.error(e);
        }
      }

      // Leave all rooms
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });
    });
  });

  // --- API Endpoints ---

  apiRouter.post('/lobbies', async (req, res) => {
    try {
      const lobby = await lobbyService.createLobby(req.body.name, req.body.userId);
      res.status(201).json(lobby);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  apiRouter.get('/lobbies', async (req, res) => {
    try {
      const lobbies = await lobbyService.getAllLobbies();
      res.json(lobbies);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  apiRouter.get('/lobbies/:id', async (req, res) => {
    try {
      const lobby = await lobbyService.getLobbyById(req.params.id);
      if (!lobby) return res.status(404).json({ error: 'Not found' });
      res.json(lobby);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  apiRouter.post('/lobbies/:lobbyId/join', async (req, res) => {
    try {
      const { userName } = await lobbyService.joinLobby(req.params.lobbyId, req.body.userId);

      // Crucial: emit to the room (lobbyId)
      io.to(req.params.lobbyId).emit('player_joined', {
        userId: req.body.userId,
        name: userName,
      });
      res.status(200).json({ message: 'Joined' });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  apiRouter.post('/login', async (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Username is required' });
    }

    try {
      const user = await findOrCreateUser(name);
      console.log(`User logged in: ${user.name} (ID: ${user.id})`);

      // Basic tracking (will refine with socket integration in next step)
      res.status(200).json(user);
    } catch (err: unknown) {
      console.error('Login/create user failed:', err);
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  app.get('/debug', async (req, res) => {
    let lobbies: any[] = [];
    let connectionDetails: any[] = [];
    let dbStatusError: string | null = null;

    try {
      const client = await getDbClient();
      try {
        const result = await client.query('SELECT * FROM lobbies');
        lobbies = result.rows;
      } catch (e) {
        console.error('Error fetching lobbies for debug:', e);
      }

      for (const [socketId, socket] of io.sockets.sockets.entries()) {
        const userId = socketToUserMap.get(socketId);
        let userDetails: { userId: string | null; user: any | null } = { userId: null, user: null };

        if (userId) {
          try {
            const userRecord = await client.query('SELECT id, name FROM users WHERE id = $1', [
              userId,
            ]);
            userDetails = {
              userId,
              user: userRecord.rows.length > 0 ? userRecord.rows[0] : null,
            };
          } catch (e) {
            console.error(`Error fetching user details for user ID ${userId}:`, e);
          }
        }

        const subscribedRooms = Array.from(socket.rooms).filter((room) => room !== socket.id);
        connectionDetails.push({ socketId, ...userDetails, rooms: subscribedRooms });
      }
      client.release();
    } catch (e) {
      dbStatusError = e instanceof Error ? e.message : String(e);
      console.error('Database connection error in /debug endpoint:', e);
    }

    res.json({
      status: {
        uptime: process.uptime(),
        socketClients: io.engine.clientsCount,
        dbError: dbStatusError,
      },
      state: {
        ephemeralState: {
          connectedUsers: Array.from(socketToUserMap.values()),
          connectionDetails: connectionDetails,
        },
        persistentState: {
          activeLobbies: lobbies,
        },
      },
    });
  });

  return { app, httpServer, io };
}

export async function initializeServer() {
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
