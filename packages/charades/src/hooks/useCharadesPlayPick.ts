import { useCallback, useState } from 'react';
import type { Difficulty } from '../types.js';
import type { NextCardPick } from '../types.js';

const PLAY_PICK_KEY = 'charades-play-pick';

export interface PlayPickPersisted {
  lastDifficulty?: Difficulty;
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

function initialDifficulties(
  persisted: PlayPickPersisted,
  enabledDifficulties: Difficulty[],
): Difficulty[] {
  const fromList = persisted.lastDifficulties?.filter((d) => enabledDifficulties.includes(d));
  if (fromList && fromList.length > 0) return fromList;
  if (persisted.lastDifficulty && enabledDifficulties.includes(persisted.lastDifficulty)) {
    return [persisted.lastDifficulty];
  }
  return [];
}

/**
 * Per-card pick state: difficulty persists between turns; pack/multi-difficulty via Filters sheet.
 */
export function useCharadesPlayPick(
  enabledPackIds: string[],
  showPackPick: boolean,
  enabledDifficulties: Difficulty[],
) {
  const [persisted] = useState(() => loadPlayPick());
  const [pickDifficulties, setPickDifficulties] = useState<Difficulty[]>(() =>
    initialDifficulties(persisted, enabledDifficulties),
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

  const persist = useCallback((difficulties: Difficulty[], packIds: string[]) => {
    savePlayPick({
      lastDifficulty: difficulties.length === 1 ? difficulties[0] : undefined,
      lastDifficulties: difficulties,
      lastPackIds: packIds,
    });
  }, []);

  const buildPick = useCallback((): NextCardPick => {
    const difficulties =
      pickDifficulties.length > 0
        ? pickDifficulties
        : enabledDifficulties.length > 0
          ? enabledDifficulties
          : (['easy'] as Difficulty[]);
    return {
      difficulties,
      packIds:
        showPackPick && effectivePickPackIds.length < enabledPackIds.length
          ? effectivePickPackIds
          : [],
    };
  }, [pickDifficulties, effectivePickPackIds, showPackPick, enabledPackIds, enabledDifficulties]);

  const resetForNextTurn = useCallback(() => {
    setCardDrawn(false);
  }, []);

  const markCardDrawn = useCallback(() => {
    setCardDrawn(true);
  }, []);

  const setSingleDifficulty = useCallback(
    (level: Difficulty) => {
      setPickDifficulties([level]);
      persist([level], effectivePickPackIds);
    },
    [persist, effectivePickPackIds],
  );

  const togglePickDifficulty = useCallback(
    (level: Difficulty) => {
      setPickDifficulties((prev) => {
        let next: Difficulty[];
        if (prev.includes(level)) {
          if (prev.length <= 1) return prev;
          next = prev.filter((item) => item !== level);
        } else {
          next = [...prev, level];
        }
        persist(next, effectivePickPackIds);
        return next;
      });
      setCardDrawn(false);
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
        persist(pickDifficulties, next);
        return next;
      });
      setCardDrawn(false);
    },
    [persist, pickDifficulties],
  );

  const applyFilters = useCallback(() => {
    persist(pickDifficulties, effectivePickPackIds);
    return buildPick();
  }, [persist, pickDifficulties, effectivePickPackIds, buildPick]);

  return {
    pickDifficulties,
    pickPackIds: effectivePickPackIds,
    togglePickDifficulty,
    togglePickPack,
    setSingleDifficulty,
    buildPick,
    applyFilters,
    cardDrawn,
    resetForNextTurn,
    markCardDrawn,
    hasDifficultySelected: pickDifficulties.length > 0,
  };
}
