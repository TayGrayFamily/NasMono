import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDbClient, dbStatus, dbConnectionError, findOrCreateUser } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
app.use(express.json());

const apiRouter = express.Router();
app.use('/api', apiRouter);

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

// Map userId -> socketId (for easy lookup)
const userSocketMap = new Map<string, string>();
// Map socketId -> userId (for disconnects)
const socketToUserMap = new Map<string, string>();

io.on('connection', (socket) => {
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
      socketToUserMap.delete(socket.id);
      userSocketMap.delete(userId);
    }
  });
});

// --- API Endpoints ---
apiRouter.post('/login', async (req, res) => {
  try {
    const { name } = req.body;
    const client = await getDbClient();
    let result = await client.query('SELECT * FROM users WHERE name = $1', [name]);
    if (result.rows.length === 0) {
      result = await client.query(
        'INSERT INTO users (name, is_temporary) VALUES ($1, false) RETURNING *',
        [name],
      );
    }
    client.release();
    res.status(200).json(result.rows[0]);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/lobbies', async (req, res) => {
  try {
    const client = await getDbClient();
    const lobby = await client.query('INSERT INTO lobbies (name) VALUES ($1) RETURNING id', [
      req.body.name || 'New Lobby',
    ]);
    await client.query('INSERT INTO lobby_players (lobby_id, user_id) VALUES ($1, $2)', [
      lobby.rows[0].id,
      req.body.userId,
    ]);
    client.release();
    res.status(201).json({ lobbyId: lobby.rows[0].id });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.get('/lobbies', async (req, res) => {
  try {
    const client = await getDbClient();
    const result = await client.query(
      `SELECT l.id, l.name, COUNT(lp.user_id) as playerCount FROM lobbies l LEFT JOIN lobby_players lp ON l.id = lp.lobby_id GROUP BY l.id`,
    );
    client.release();
    res.json(result.rows);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.get('/lobbies/:id', async (req, res) => {
  try {
    const client = await getDbClient();
    const lobby = await client.query('SELECT * FROM lobbies WHERE id = $1', [req.params.id]);
    const players = await client.query(
      'SELECT u.id, u.name FROM users u JOIN lobby_players lp ON u.id = lp.user_id WHERE lp.lobby_id = $1',
      [req.params.id],
    );
    client.release();
    if (lobby.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ...lobby.rows[0], players: players.rows });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

apiRouter.post('/lobbies/:lobbyId/join', async (req, res) => {
  try {
    const client = await getDbClient();
    await client.query(
      'INSERT INTO lobby_players (lobby_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.lobbyId, req.body.userId],
    );
    const user = await client.query('SELECT name FROM users WHERE id = $1', [req.body.userId]);
    client.release();

    // Crucial: emit to the room (lobbyId)
    io.to(req.params.lobbyId).emit('player_joined', {
      userId: req.body.userId,
      name: user.rows[0].name,
    });
    res.status(200).json({ message: 'Joined' });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// --- Login API ---
apiRouter.post('/login', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // Use findOrCreateUser to log in an existing user or create a new one
    const user = await findOrCreateUser(name);
    console.log(`User logged in/created: ${user.name} (ID: ${user.id})`);
    res.status(200).json(user);
  } catch (err: unknown) {
    console.error('Login/create user failed:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get('/debug', async (req, res) => {
  let lobbies: any[] = [];
  try {
    const client = await getDbClient();
    const result = await client.query('SELECT * FROM lobbies');
    lobbies = result.rows;
    client.release();
  } catch (e) {}

  res.json({
    status: {
      uptime: process.uptime(),
      dbStatus,
      dbConnectionError,
      socketClients: io.engine.clientsCount,
    },
    state: { activeLobbies: lobbies, connectedUsers: Array.from(socketToUserMap.values()) },
  });
});

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
