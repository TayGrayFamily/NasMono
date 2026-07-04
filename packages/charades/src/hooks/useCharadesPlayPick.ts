import { useCallback, useEffect, useState } from 'react';
import type { Difficulty } from '../types.js';

const PLAY_PICK_KEY = 'charades-play-pick';

export interface PlayPickPersisted {
  lastDifficulty?: Difficulty;
  lastPackIds?: string[];
}

function loadPlayPick(): PlayPickPersisted {
  try {
    const raw = sessionStorage.getItem(PLAY_PICK_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PlayPickPersisted;
    return {
      lastDifficulty:
        parsed.lastDifficulty === 'easy' ||
        parsed.lastDifficulty === 'medium' ||
        parsed.lastDifficulty === 'hard'
          ? parsed.lastDifficulty
          : undefined,
      lastPackIds: Array.isArray(parsed.lastPackIds)
        ? parsed.lastPackIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
        : undefined,
    };
  } catch {
    return {};
  }
}

export function savePlayPick(state: PlayPickPersisted) {
  sessionStorage.setItem(PLAY_PICK_KEY, JSON.stringify(state));
}

export function clearPlayPick() {
  sessionStorage.removeItem(PLAY_PICK_KEY);
}

/**
 * Per-turn card draw: player must tap a difficulty FAB before reveal.
 * Persists last choices in sessionStorage for the next passer.
 */
export function useCharadesPlayPick(enabledPackIds: string[], showPackPick: boolean) {
  const [persisted] = useState(() => loadPlayPick());
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | null>(null);
  const [pickPackIds, setPickPackIds] = useState<string[]>(() => {
    const saved = persisted.lastPackIds?.filter((id) => enabledPackIds.includes(id));
    if (saved && saved.length > 0) return saved;
    return [...enabledPackIds];
  });
  const [cardDrawn, setCardDrawn] = useState(false);

  useEffect(() => {
    setPickPackIds((prev) => {
      const kept = prev.filter((id) => enabledPackIds.includes(id));
      if (kept.length > 0) return kept;
      return [...enabledPackIds];
    });
  }, [enabledPackIds]);

  const resetForNextTurn = useCallback(() => {
    setActiveDifficulty(null);
    setCardDrawn(false);
  }, []);

  const togglePickPack = useCallback(
    (packId: string) => {
      setPickPackIds((prev) => {
        if (prev.includes(packId)) {
          if (prev.length <= 1) return prev;
          return prev.filter((id) => id !== packId);
        }
        return [...prev, packId];
      });
      setCardDrawn(false);
      setActiveDifficulty(null);
    },
    [],
  );

  const selectDifficulty = useCallback(
    (level: Difficulty): { difficulties: Difficulty[]; packIds: string[] } => {
      setActiveDifficulty(level);
      setCardDrawn(true);
      savePlayPick({
        lastDifficulty: level,
        lastPackIds: pickPackIds,
      });
      return {
        difficulties: [level],
        packIds: showPackPick && pickPackIds.length < enabledPackIds.length ? pickPackIds : [],
      };
    },
    [pickPackIds, showPackPick, enabledPackIds.length],
  );

  const suggestedDifficulty = persisted.lastDifficulty;

  return {
    activeDifficulty,
    suggestedDifficulty,
    pickPackIds,
    togglePickPack,
    selectDifficulty,
    cardDrawn,
    resetForNextTurn,
  };
}
