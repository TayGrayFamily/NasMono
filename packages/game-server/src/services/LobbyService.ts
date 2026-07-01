import { getDbClient } from '../db/index.js';

export type LobbyLeaveResult = {
  lobbyId: string;
  lobbyDeleted: boolean;
  wasHost: boolean;
  newHostId?: string;
};

export class LobbyService {
  async createLobby(name: string, userId: string) {
    const left = await this.leaveAllLobbiesExcept(userId, null);

    const client = await getDbClient();
    try {
      const lobby = await client.query(
        'INSERT INTO lobbies (name, host_id) VALUES ($1, $2) RETURNING id',
        [name || 'New Lobby', userId],
      );
      await client.query('INSERT INTO lobby_players (lobby_id, user_id) VALUES ($1, $2)', [
        lobby.rows[0].id,
        userId,
      ]);
      return { lobbyId: lobby.rows[0].id, left };
    } finally {
      client.release();
    }
  }

  async getAllLobbies() {
    const client = await getDbClient();
    try {
      const result = await client.query(
        `SELECT l.id, l.name, l.host_id as "hostId", u.name as "hostName",
                COUNT(lp.user_id)::int as "playerCount"
         FROM lobbies l
         LEFT JOIN users u ON u.id = l.host_id
         LEFT JOIN lobby_players lp ON l.id = lp.lobby_id
         GROUP BY l.id, u.name
         ORDER BY l.created_at DESC`,
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getLobbyById(id: string) {
    const client = await getDbClient();
    try {
      const lobby = await client.query(
        'SELECT id, name, host_id as "hostId" FROM lobbies WHERE id = $1',
        [id],
      );
      const players = await client.query(
        'SELECT u.id, u.name FROM users u JOIN lobby_players lp ON u.id = lp.user_id WHERE lp.lobby_id = $1 ORDER BY lp.joined_at ASC',
        [id],
      );
      if (lobby.rows.length === 0) return null;
      return { ...lobby.rows[0], players: players.rows };
    } finally {
      client.release();
    }
  }

  async joinLobby(lobbyId: string, userId: string) {
    const left = await this.leaveAllLobbiesExcept(userId, lobbyId);

    const client = await getDbClient();
    try {
      const existing = await client.query(
        'SELECT 1 FROM lobby_players WHERE lobby_id = $1 AND user_id = $2',
        [lobbyId, userId],
      );
      const alreadyMember = existing.rows.length > 0;

      await client.query(
        'INSERT INTO lobby_players (lobby_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [lobbyId, userId],
      );
      const user = await client.query('SELECT name FROM users WHERE id = $1', [userId]);
      return {
        userName: user.rows[0]?.name,
        alreadyMember,
        left,
      };
    } finally {
      client.release();
    }
  }

  async leaveLobby(lobbyId: string, userId: string): Promise<LobbyLeaveResult> {
    const client = await getDbClient();
    try {
      const lobbyCheck = await client.query('SELECT host_id FROM lobbies WHERE id = $1', [lobbyId]);
      const wasHost = lobbyCheck.rows.length > 0 && lobbyCheck.rows[0].host_id === userId;

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
        return { lobbyId, lobbyDeleted: true, wasHost };
      }

      let newHostId: string | undefined;
      if (wasHost) {
        newHostId = remaining.rows[0].user_id;
        await client.query('UPDATE lobbies SET host_id = $1 WHERE id = $2', [newHostId, lobbyId]);
      }

      return { lobbyId, lobbyDeleted: false, wasHost, newHostId };
    } finally {
      client.release();
    }
  }

  async getUserLobbyIds(userId: string): Promise<string[]> {
    const client = await getDbClient();
    try {
      const res = await client.query('SELECT lobby_id FROM lobby_players WHERE user_id = $1', [
        userId,
      ]);
      return res.rows.map((r: { lobby_id: string }) => r.lobby_id);
    } finally {
      client.release();
    }
  }

  async leaveAllLobbiesExcept(
    userId: string,
    exceptLobbyId: string | null,
  ): Promise<LobbyLeaveResult[]> {
    const ids = await this.getUserLobbyIds(userId);
    const results: LobbyLeaveResult[] = [];

    for (const lobbyId of ids) {
      if (exceptLobbyId && lobbyId === exceptLobbyId) continue;
      results.push(await this.leaveLobby(lobbyId, userId));
    }

    return results;
  }
}
