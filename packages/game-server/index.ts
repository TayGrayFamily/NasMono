import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDbClient, dbStatus, dbConnectionError } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
app.use(express.json());

const apiRouter = express.Router();
app.use('/api', apiRouter);

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

const socketIdToUserId: Map<string, string> = new Map();

io.on('connection', (socket) => {
  socket.on('join_lobby_room', (data: { lobbyId: string; userId: string }) => {
    if (data.lobbyId && data.userId) {
      socket.join(data.lobbyId);
      socketIdToUserId.set(socket.id, data.userId);
    }
  });
  socket.on('disconnect', async () => {
    const userId = socketIdToUserId.get(socket.id);
    if (userId) {
      try {
        const client = await getDbClient();
        const res = await client.query('SELECT lobby_id FROM lobby_players WHERE user_id = $1', [
          userId,
        ]);
        if (res.rows.length > 0) {
          const lobbyId = res.rows[0].lobby_id;
          await client.query('DELETE FROM lobby_players WHERE user_id = $1', [userId]);
          io.to(lobbyId).emit('player_left', { lobbyId, userId });
        }
        client.release();
      } catch (e) {
        console.error(e);
      }
      socketIdToUserId.delete(socket.id);
    }
  });
});

// --- API Endpoints ---
apiRouter.post('/players', async (req, res) => {
  try {
    const client = await getDbClient();
    const result = await client.query('INSERT INTO users (name) VALUES ($1) RETURNING *', [
      req.body.name,
    ]);
    client.release();
    res.status(201).json(result.rows[0]);
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
    io.to(req.params.lobbyId).emit('player_joined', {
      userId: req.body.userId,
      name: user.rows[0].name,
    });
    res.status(200).json({ message: 'Joined' });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get('/status', (req, res) => {
  res.json({
    server: { uptime: process.uptime() },
    dbStatus,
    dbConnectionError,
    socketClients: io.engine.clientsCount,
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
