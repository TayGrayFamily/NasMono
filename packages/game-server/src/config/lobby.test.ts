import { describe, it, expect, afterEach, vi } from 'vitest';
import { getMaxLobbySize, LobbyFullError } from './lobby.js';

describe('lobby config', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults max lobby size to 20', () => {
    expect(getMaxLobbySize()).toBe(20);
  });

  it('reads MAX_LOBBY_SIZE from env', () => {
    vi.stubEnv('MAX_LOBBY_SIZE', '5');
    expect(getMaxLobbySize()).toBe(5);
  });

  it('LobbyFullError includes max size in message', () => {
    const err = new LobbyFullError(20);
    expect(err.message).toBe('Lobby is full (20 players max)');
  });
});
