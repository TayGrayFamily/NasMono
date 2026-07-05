import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearPlayPick,
  initialPickDifficulty,
  savePlayPick,
} from './useCharadesPlayPick.js';
import { ANY_DIFFICULTY } from '../lib/difficulties.js';

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

  it('saves single difficulty and pack ids to sessionStorage', () => {
    savePlayPick({
      lastDifficulty: 'hard',
      lastPackIds: ['animals', 'movies'],
    });
    const raw = sessionStorage.getItem('charades-play-pick');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toEqual({
      lastDifficulty: 'hard',
      lastPackIds: ['animals', 'movies'],
    });
  });

  it('saves any-difficulty pick', () => {
    savePlayPick({ lastPickAll: true });
    expect(JSON.parse(sessionStorage.getItem('charades-play-pick')!)).toEqual({
      lastPickAll: true,
    });
  });

  it('clears persisted play pick', () => {
    savePlayPick({ lastDifficulty: 'easy' });
    clearPlayPick();
    expect(sessionStorage.getItem('charades-play-pick')).toBeNull();
  });
});

describe('initialPickDifficulty', () => {
  it('restores single persisted difficulty', () => {
    expect(
      initialPickDifficulty({ lastDifficulty: 'easy' }, ['easy', 'medium', 'hard']),
    ).toBe('easy');
  });

  it('restores any when lastPickAll is set', () => {
    expect(initialPickDifficulty({ lastPickAll: true }, ['easy', 'hard'])).toBe(ANY_DIFFICULTY);
  });

  it('coerces legacy multi-select to any', () => {
    expect(
      initialPickDifficulty({ lastDifficulties: ['easy', 'hard'] }, ['easy', 'medium', 'hard']),
    ).toBe(ANY_DIFFICULTY);
  });
});
