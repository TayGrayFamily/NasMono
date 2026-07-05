import { useCallback, useState } from 'react';
import type { Difficulty } from '../types.js';
import { ANY_DIFFICULTY, isAllDifficultiesSelection } from '../lib/difficulties.js';
import type { DifficultyChoice } from '../lib/difficulties.js';
import type { NextCardPick } from '../types.js';

const PLAY_PICK_KEY = 'charades-play-pick';

export interface PlayPickPersisted {
  lastDifficulty?: Difficulty;
  lastPickAll?: boolean;
  /** @deprecated Legacy multi-select — normalized on load. */
  lastDifficulties?: Difficulty[];
  lastPackIds?: string[];
}

function loadPlayPick(): PlayPickPersisted {
  try {
    const raw = sessionStorage.getItem(PLAY_PICK_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PlayPickPersisted;
    const lastDifficulty =
      parsed.lastDifficulty === 'easy' ||
      parsed.lastDifficulty === 'medium' ||
      parsed.lastDifficulty === 'hard'
        ? parsed.lastDifficulty
        : undefined;
    const lastDifficulties = Array.isArray(parsed.lastDifficulties)
      ? parsed.lastDifficulties.filter(
          (d): d is Difficulty => d === 'easy' || d === 'medium' || d === 'hard',
        )
      : undefined;
    return {
      lastDifficulty,
      lastPickAll: parsed.lastPickAll === true,
      lastDifficulties,
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

export function initialPickDifficulty(
  persisted: PlayPickPersisted,
  enabledDifficulties: Difficulty[],
): DifficultyChoice | null {
  if (persisted.lastPickAll) {
    return enabledDifficulties.length > 0 ? ANY_DIFFICULTY : null;
  }
  if (persisted.lastDifficulty && enabledDifficulties.includes(persisted.lastDifficulty)) {
    return persisted.lastDifficulty;
  }
  const fromList = persisted.lastDifficulties?.filter((d) => enabledDifficulties.includes(d));
  if (!fromList || fromList.length === 0) return null;
  if (fromList.length === 1) return fromList[0]!;
  if (isAllDifficultiesSelection(fromList, enabledDifficulties)) return ANY_DIFFICULTY;
  return ANY_DIFFICULTY;
}

/**
 * Per-card pick state: single difficulty or any; pack narrowing via Filters sheet.
 */
export function useCharadesPlayPick(
  enabledPackIds: string[],
  showPackPick: boolean,
  enabledDifficulties: Difficulty[],
) {
  const [persisted] = useState(() => loadPlayPick());
  const [pickDifficulty, setPickDifficulty] = useState<DifficultyChoice | null>(() =>
    initialPickDifficulty(persisted, enabledDifficulties),
  );
  const [pickPackIds, setPickPackIds] = useState<string[]>(() => {
    const saved = persisted.lastPackIds?.filter((id) => enabledPackIds.includes(id));
    if (saved && saved.length > 0) return saved;
    return [...enabledPackIds];
  });
  const [cardDrawn, setCardDrawn] = useState(false);

  const effectivePickPackIds = (() => {
    const kept = pickPackIds.filter((id) => enabledPackIds.includes(id));
    if (kept.length > 0) return kept;
    return [...enabledPackIds];
  })();

  const persist = useCallback(
    (choice: DifficultyChoice, packIds: string[]) => {
      savePlayPick({
        lastDifficulty: choice === ANY_DIFFICULTY ? undefined : choice,
        lastPickAll: choice === ANY_DIFFICULTY,
        lastPackIds: packIds,
      });
    },
    [],
  );

  const buildPick = useCallback((): NextCardPick => {
    const difficulties =
      pickDifficulty === null || pickDifficulty === ANY_DIFFICULTY
        ? []
        : [pickDifficulty];
    return {
      difficulties,
      packIds:
        showPackPick && effectivePickPackIds.length < enabledPackIds.length
          ? effectivePickPackIds
          : [],
    };
  }, [pickDifficulty, effectivePickPackIds, showPackPick, enabledPackIds]);

  const resetForNextTurn = useCallback(() => {
    setCardDrawn(false);
  }, []);

  const markCardDrawn = useCallback(() => {
    setCardDrawn(true);
  }, []);

  const selectPickDifficulty = useCallback(
    (choice: DifficultyChoice) => {
      setPickDifficulty(choice);
      persist(choice, effectivePickPackIds);
    },
    [persist, effectivePickPackIds],
  );

  const togglePickPack = useCallback(
    (packId: string) => {
      setPickPackIds((prev) => {
        let next: string[];
        if (prev.includes(packId)) {
          if (prev.length <= 1) return prev;
          next = prev.filter((id) => id !== packId);
        } else {
          next = [...prev, packId];
        }
        if (pickDifficulty !== null) {
          persist(pickDifficulty, next);
        }
        return next;
      });
      setCardDrawn(false);
    },
    [persist, pickDifficulty],
  );

  const applyFilters = useCallback(() => {
    if (pickDifficulty !== null) {
      persist(pickDifficulty, effectivePickPackIds);
    }
    return buildPick();
  }, [persist, pickDifficulty, effectivePickPackIds, buildPick]);

  return {
    pickDifficulty,
    pickPackIds: effectivePickPackIds,
    togglePickPack,
    selectPickDifficulty,
    buildPick,
    applyFilters,
    cardDrawn,
    resetForNextTurn,
    markCardDrawn,
    hasDifficultySelected: pickDifficulty !== null,
  };
}
