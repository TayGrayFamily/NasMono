import express from 'express';
import { LobbyService } from '../services/LobbyService.js';
import { SocketService } from '../services/SocketService.js';
import { getDbClient } from '../db/index.js';
import { createRequireSocketUser } from '../middleware/requireSocketUser.js';

export function createLobbyRouter(lobbyService: LobbyService, socketService: SocketService) {
  const router = express.Router();
  const io = socketService.getIo();
  const requireSocketUser = createRequireSocketUser(socketService);
  const requireSocketUserForTransfer = createRequireSocketUser(socketService, ['currentUserId']);

  router.post('/', requireSocketUser, async (req, res) => {
    try {
      const userId = req.identifiedUserId!;
      const lobby = await lobbyService.createLobby(req.body.name, userId);
      socketService.emitLobbyCreated(lobby.lobbyId);
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

      const connectedIds = new Set(socketService.getConnectedUserIdsInLobby(req.params.id));
      const playersWithPresence = lobby.players.map((player: { id: string; name: string }) => ({
        ...player,
        connected: connectedIds.has(player.id),
      }));

      res.json({ ...lobby, players: playersWithPresence });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  router.post('/:lobbyId/join', requireSocketUser, async (req, res) => {
    try {
      const userId = req.identifiedUserId!;
      const lobbyId = String(req.params.lobbyId);
      const { userName } = await lobbyService.joinLobby(lobbyId, userId);
      io.to(lobbyId).emit('player_joined', {
        userId,
        name: userName,
      });
      socketService.emitLobbyUpdated(lobbyId);
      res.status(200).json({ message: 'Joined' });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  router.post('/:lobbyId/leave', requireSocketUser, async (req, res) => {
    const lobbyId = String(req.params.lobbyId);
    const userId = req.identifiedUserId!;

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
        socketService.emitLobbyDeleted(lobbyId);
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
        socketService.emitLobbyUpdated(lobbyId);
      }

      client.release();
      res.json({ message: 'Left lobby' });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  router.post('/:lobbyId/transfer-host', requireSocketUserForTransfer, async (req, res) => {
    const lobbyId = String(req.params.lobbyId);
    const currentUserId = req.identifiedUserId!;
    const { newHostId } = req.body;

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
      socketService.emitLobbyUpdated(lobbyId);
      res.json({ message: 'Host transferred' });
    } catch (err: unknown) {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  return router;
}
