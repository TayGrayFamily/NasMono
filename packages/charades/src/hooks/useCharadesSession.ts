import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CharadesSessionConfig, CharadesCard, Difficulty } from '../types.js';
import { getPackById } from '../data/index.js';
import {
  advanceDeck,
  createDeckState,
  drawCurrent,
  filterByDifficulty,
  type DeckState,
} from '../lib/deck.js';

const SESSION_KEY = 'charades-session';

function loadSessionConfig(): CharadesSessionConfig | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CharadesSessionConfig;
    if (parsed?.packId && parsed?.difficulty) return parsed;
  } catch {
    // ignore corrupt storage
  }
  return null;
}

export function saveSessionConfig(config: CharadesSessionConfig) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(config));
}

export function clearSessionConfig() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function useCharadesSetup() {
  const [packId, setPackId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  const pack = packId ? getPackById(packId) : undefined;

  const filteredCount = useMemo(() => {
    if (!pack) return 0;
    return filterByDifficulty(pack.cards, difficulty).length;
  }, [pack, difficulty]);

  const canStart = Boolean(pack && filteredCount > 0);

  const startSession = useCallback(() => {
    if (!packId || !canStart) return null;
    const config = { packId, difficulty };
    saveSessionConfig(config);
    return config;
  }, [packId, difficulty, canStart]);

  return {
    packId,
    setPackId,
    difficulty,
    setDifficulty,
    pack,
    filteredCount,
    canStart,
    startSession,
  };
}

export function useCharadesPlay() {
  const config = useMemo(() => loadSessionConfig(), []);
  const pack = config ? getPackById(config.packId) : undefined;

  const [deckState, setDeckState] = useState<DeckState | null>(() => {
    if (!config || !pack) return null;
    return createDeckState(pack.cards, config.difficulty);
  });

  const [revealed, setRevealed] = useState(false);

  const currentCard: CharadesCard | null = deckState ? drawCurrent(deckState) : null;

  const reveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const nextCard = useCallback(() => {
    setDeckState((prev) => (prev ? advanceDeck(prev) : prev));
    setRevealed(false);
  }, []);

  const revealOrNext = useCallback(() => {
    if (!revealed) {
      reveal();
    } else {
      nextCard();
    }
  }, [revealed, reveal, nextCard]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        revealOrNext();
      }
      if (event.code === 'ArrowRight' && revealed) {
        event.preventDefault();
        nextCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealed, revealOrNext, nextCard]);

  return {
    config,
    pack,
    currentCard,
    revealed,
    reveal,
    nextCard,
    revealOrNext,
    isReady: Boolean(config && pack && deckState && currentCard),
  };
}
