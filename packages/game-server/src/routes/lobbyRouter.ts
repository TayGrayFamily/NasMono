import express from 'express';
import { LobbyService } from '../services/LobbyService.js';
import { SocketService } from '../services/SocketService.js';
import { getDbClient } from '../db/index.js';

export function createLobbyRouter(lobbyService: LobbyService, socketService: SocketService) {
  const router = express.Router();
  const io = socketService.getIo();

  router.post('/', async (req, res) => {
    try {
      const lobby = await lobbyService.createLobby(req.body.name, req.body.userId);
      res.status(201).json(lobby);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const lobbies = await lobbyService.getAllLobbies();
      res.json(lobbies);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const lobby = await lobbyService.getLobbyById(req.params.id);
      if (!lobby) return res.status(404).json({ error: 'Not found' });
      res.json(lobby);
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  router.post('/:lobbyId/join', async (req, res) => {
    try {
      const { userName } = await lobbyService.joinLobby(req.params.lobbyId, req.body.userId);
      io.to(req.params.lobbyId).emit('player_joined', {
        userId: req.body.userId,
        name: userName,
      });
      res.status(200).json({ message: 'Joined' });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  router.post('/:lobbyId/leave', async (req, res) => {
    const { lobbyId } = req.params;
    const { userId } = req.body;

    try {
      const client = await getDbClient();
      await client.query('DELETE FROM lobby_players WHERE lobby_id = $1 AND user_id = $2', [
        lobbyId,
        userId,
      ]);

      const remaining = await client.query(
        'SELECT user_id FROM lobby_players WHERE lobby_id = $1 ORDER BY joined_at ASC',
        [lobbyId],
      );

      if (remaining.rows.length === 0) {
        await client.query('DELETE FROM lobbies WHERE id = $1', [lobbyId]);
      } else {
        const lobbyCheck = await client.query('SELECT host_id FROM lobbies WHERE id = $1', [
          lobbyId,
        ]);
        if (lobbyCheck.rows.length > 0 && lobbyCheck.rows[0].host_id === userId) {
          const newHostId = remaining.rows[0].user_id;
          await client.query('UPDATE lobbies SET host_id = $1 WHERE id = $2', [newHostId, lobbyId]);
          io.to(lobbyId).emit('host_transferred', { newHostId });
        }
        io.to(lobbyId).emit('player_left', { userId });
      }

      client.release();
      res.json({ message: 'Left lobby' });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  router.post('/:lobbyId/transfer-host', async (req, res) => {
    const { lobbyId } = req.params;
    const { newHostId, currentUserId } = req.body;

    try {
      const lobby = await lobbyService.getLobbyById(lobbyId);
      if (!lobby) return res.status(404).json({ error: 'Lobby not found' });

      if (lobby.hostId !== currentUserId) {
        return res.status(403).json({ error: 'Only the host can transfer ownership' });
      }

      const client = await getDbClient();
      await client.query('UPDATE lobbies SET host_id = $1 WHERE id = $2', [newHostId, lobbyId]);
      client.release();

      io.to(lobbyId).emit('host_transferred', { newHostId });
      res.json({ message: 'Host transferred' });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  return router;
}
