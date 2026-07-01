export const USER_STORAGE_KEY = 'game-hub-user';
export const LAST_LOBBY_STORAGE_KEY = 'game-hub-last-lobby';

export function setLastLobbyId(lobbyId: string | null) {
  if (lobbyId) {
    localStorage.setItem(LAST_LOBBY_STORAGE_KEY, lobbyId);
  } else {
    localStorage.removeItem(LAST_LOBBY_STORAGE_KEY);
  }
}

export function getLastLobbyId(): string | null {
  return localStorage.getItem(LAST_LOBBY_STORAGE_KEY);
}
