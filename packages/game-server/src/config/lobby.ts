export function getMaxLobbySize(): number {
  const raw = process.env.MAX_LOBBY_SIZE;
  if (raw) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed >= 2) return parsed;
  }
  return 20;
}

export class LobbyFullError extends Error {
  readonly maxSize: number;

  constructor(maxSize: number) {
    super(`Lobby is full (${maxSize} players max)`);
    this.name = 'LobbyFullError';
    this.maxSize = maxSize;
  }
}
