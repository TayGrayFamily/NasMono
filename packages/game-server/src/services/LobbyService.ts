import { getDbClient } from '../db/index.js';

export class LobbyService {
  async createLobby(name: string, userId: string) {
    const client = await getDbClient();
    try {
      const lobby = await client.query('INSERT INTO lobbies (name) VALUES ($1) RETURNING id', [
        name || 'New Lobby',
      ]);
      await client.query('INSERT INTO lobby_players (lobby_id, user_id) VALUES ($1, $2)', [
        lobby.rows[0].id,
        userId,
      ]);
      return { lobbyId: lobby.rows[0].id };
    } finally {
      client.release();
    }
  }

  async getAllLobbies() {
    const client = await getDbClient();
    try {
      const result = await client.query(
        `SELECT l.id, l.name, COUNT(lp.user_id) as playerCount FROM lobbies l LEFT JOIN lobby_players lp ON l.id = lp.lobby_id GROUP BY l.id`,
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getLobbyById(id: string) {
    const client = await getDbClient();
    try {
      const lobby = await client.query('SELECT * FROM lobbies WHERE id = $1', [id]);
      const players = await client.query(
        'SELECT u.id, u.name FROM users u JOIN lobby_players lp ON u.id = lp.user_id WHERE lp.lobby_id = $1',
        [id],
      );
      if (lobby.rows.length === 0) return null;
      return { ...lobby.rows[0], players: players.rows };
    } finally {
      client.release();
    }
  }

  async joinLobby(lobbyId: string, userId: string) {
    const client = await getDbClient();
    try {
      await client.query(
        'INSERT INTO lobby_players (lobby_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [lobbyId, userId],
      );
      const user = await client.query('SELECT name FROM users WHERE id = $1', [userId]);
      return { userName: user.rows[0]?.name };
    } finally {
      client.release();
    }
  }
}
