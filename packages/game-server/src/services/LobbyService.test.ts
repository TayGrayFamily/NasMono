import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LobbyService } from './LobbyService.js';
import * as db from '../db/index.js';

vi.mock('../db/index.js');

function mockClient(queryImpl: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>) {
  return {
    query: vi.fn(queryImpl),
    release: vi.fn(),
  };
}

describe('LobbyService', () => {
  let service: LobbyService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LobbyService();
  });

  describe('leaveLobby', () => {
    it('deletes the lobby when the last player leaves', async () => {
      const client = mockClient(async (sql) => {
        if (sql.includes('SELECT host_id')) return { rows: [{ host_id: 'host-1' }] };
        if (sql.startsWith('DELETE FROM lobby_players')) return { rows: [] };
        if (sql.includes('SELECT user_id FROM lobby_players')) return { rows: [] };
        if (sql.startsWith('DELETE FROM lobbies')) return { rows: [] };
        throw new Error(`Unexpected query: ${sql}`);
      });
      vi.mocked(db.getDbClient).mockResolvedValue(client as never);

      const result = await service.leaveLobby('lobby-1', 'host-1');

      expect(result).toEqual({
        lobbyId: 'lobby-1',
        lobbyDeleted: true,
        wasHost: true,
      });
      expect(client.query).toHaveBeenCalledWith('DELETE FROM lobbies WHERE id = $1', ['lobby-1']);
    });

    it('promotes the next player when the host leaves but others remain', async () => {
      const client = mockClient(async (sql) => {
        if (sql.includes('SELECT host_id')) return { rows: [{ host_id: 'host-1' }] };
        if (sql.startsWith('DELETE FROM lobby_players')) return { rows: [] };
        if (sql.includes('SELECT user_id FROM lobby_players'))
          return { rows: [{ user_id: 'guest-1' }] };
        if (sql.startsWith('UPDATE lobbies SET host_id')) return { rows: [] };
        throw new Error(`Unexpected query: ${sql}`);
      });
      vi.mocked(db.getDbClient).mockResolvedValue(client as never);

      const result = await service.leaveLobby('lobby-1', 'host-1');

      expect(result).toEqual({
        lobbyId: 'lobby-1',
        lobbyDeleted: false,
        wasHost: true,
        newHostId: 'guest-1',
      });
      expect(client.query).toHaveBeenCalledWith('UPDATE lobbies SET host_id = $1 WHERE id = $2', [
        'guest-1',
        'lobby-1',
      ]);
    });

    it('keeps the lobby when a non-host leaves', async () => {
      const client = mockClient(async (sql) => {
        if (sql.includes('SELECT host_id')) return { rows: [{ host_id: 'host-1' }] };
        if (sql.startsWith('DELETE FROM lobby_players')) return { rows: [] };
        if (sql.includes('SELECT user_id FROM lobby_players'))
          return { rows: [{ user_id: 'host-1' }] };
        throw new Error(`Unexpected query: ${sql}`);
      });
      vi.mocked(db.getDbClient).mockResolvedValue(client as never);

      const result = await service.leaveLobby('lobby-1', 'guest-1');

      expect(result).toEqual({
        lobbyId: 'lobby-1',
        lobbyDeleted: false,
        wasHost: false,
        newHostId: undefined,
      });
    });
  });

  describe('one lobby per user (ADR-0009)', () => {
    it('createLobby leaves all existing lobbies first', async () => {
      const leaveSpy = vi.spyOn(service, 'leaveAllLobbiesExcept').mockResolvedValue([]);
      const client = mockClient(async (sql) => {
        if (sql.startsWith('INSERT INTO lobbies')) return { rows: [{ id: 'new-lobby' }] };
        if (sql.startsWith('INSERT INTO lobby_players')) return { rows: [] };
        throw new Error(`Unexpected query: ${sql}`);
      });
      vi.mocked(db.getDbClient).mockResolvedValue(client as never);

      const result = await service.createLobby('Friday Night', 'user-1');

      expect(leaveSpy).toHaveBeenCalledWith('user-1', null);
      expect(result.lobbyId).toBe('new-lobby');
    });

    it('joinLobby leaves other lobbies but keeps the target lobby', async () => {
      const left = [{ lobbyId: 'old-lobby', lobbyDeleted: true, wasHost: true }];
      const leaveSpy = vi.spyOn(service, 'leaveAllLobbiesExcept').mockResolvedValue(left);
      const client = mockClient(async (sql) => {
        if (sql.includes('SELECT 1 FROM lobby_players')) return { rows: [] };
        if (sql.includes('COUNT(*)')) return { rows: [{ count: 1 }] };
        if (sql.startsWith('INSERT INTO lobby_players')) return { rows: [] };
        if (sql.includes('SELECT name FROM users')) return { rows: [{ name: 'Alex' }] };
        throw new Error(`Unexpected query: ${sql}`);
      });
      vi.mocked(db.getDbClient).mockResolvedValue(client as never);

      const result = await service.joinLobby('lobby-2', 'user-1');

      expect(leaveSpy).toHaveBeenCalledWith('user-1', 'lobby-2');
      expect(result).toMatchObject({ userName: 'Alex', alreadyMember: false, left });
    });
  });

  describe('getAllLobbies', () => {
    it('returns hostName and playerCount for lobby cards', async () => {
      const client = mockClient(async () => ({
        rows: [
          {
            id: 'lobby-1',
            name: 'Friday Night',
            hostId: 'host-1',
            hostName: 'Alex',
            playerCount: 2,
          },
        ],
      }));
      vi.mocked(db.getDbClient).mockResolvedValue(client as never);

      const lobbies = await service.getAllLobbies();

      expect(lobbies[0]).toMatchObject({
        hostName: 'Alex',
        playerCount: 2,
      });
    });
  });
});
