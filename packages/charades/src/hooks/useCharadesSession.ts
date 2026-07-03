import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CharadesSessionConfig, CharadesCard, CardType, Difficulty } from '../types.js';
import { getPackById } from '../data/index.js';
import { getTypesInPack } from '../lib/cardTypes.js';
import {
  advanceDeck,
  createDeckState,
  drawCurrent,
  filterCards,
  type DeckState,
} from '../lib/deck.js';

const SESSION_KEY = 'charades-session';

function loadSessionConfig(): CharadesSessionConfig | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CharadesSessionConfig;
    if (parsed?.packId && parsed?.difficulty && parsed?.enabledTypes?.length) return parsed;
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
  const [enabledTypes, setEnabledTypes] = useState<CardType[]>([]);

  const pack = packId ? getPackById(packId) : undefined;
  const availableTypes = useMemo(() => (pack ? getTypesInPack(pack) : []), [pack]);

  useEffect(() => {
    if (pack) {
      setEnabledTypes(getTypesInPack(pack));
    } else {
      setEnabledTypes([]);
    }
  }, [pack?.id]);

  const toggleType = useCallback((type: CardType) => {
    setEnabledTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length <= 1) return prev;
        return prev.filter((t) => t !== type);
      }
      return [...prev, type];
    });
  }, []);

  const filteredCount = useMemo(() => {
    if (!pack || enabledTypes.length === 0) return 0;
    return filterCards(pack.cards, { difficulty, types: enabledTypes }).length;
  }, [pack, difficulty, enabledTypes]);

  const canStart = Boolean(pack && filteredCount > 0);

  const startSession = useCallback(() => {
    if (!packId || !canStart) return null;
    const config: CharadesSessionConfig = { packId, difficulty, enabledTypes };
    saveSessionConfig(config);
    return config;
  }, [packId, difficulty, enabledTypes, canStart]);

  return {
    packId,
    setPackId,
    difficulty,
    setDifficulty,
    pack,
    availableTypes,
    enabledTypes,
    toggleType,
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
    return createDeckState(pack.cards, {
      difficulty: config.difficulty,
      types: config.enabledTypes,
    });
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
