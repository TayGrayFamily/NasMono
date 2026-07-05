import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearPlayPick, savePlayPick } from './useCharadesPlayPick.js';

function mockSessionStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  });
}

describe('useCharadesPlayPick persistence', () => {
  beforeEach(() => {
    mockSessionStorage();
    sessionStorage.clear();
  });

  it('saves last difficulty and pack ids to sessionStorage', () => {
    savePlayPick({
      lastDifficulty: 'hard',
      lastDifficulties: ['hard'],
      lastPackIds: ['animals', 'movies'],
    });
    const raw = sessionStorage.getItem('charades-play-pick');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toEqual({
      lastDifficulty: 'hard',
      lastDifficulties: ['hard'],
      lastPackIds: ['animals', 'movies'],
    });
  });

  it('clears persisted play pick', () => {
    savePlayPick({ lastDifficulty: 'easy' });
    clearPlayPick();
    expect(sessionStorage.getItem('charades-play-pick')).toBeNull();
  });
});
