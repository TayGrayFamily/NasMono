import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  CharadesSessionConfig,
  CharadesCard,
  CardType,
  Difficulty,
  Generation,
} from '../types.js';
import { getTypesInPack } from '../lib/cardTypes.js';
import { ALL_GENERATIONS } from '../lib/generations.js';
import { formatRoundTitle, getPacksByIds, getTypesInPacks, mergePackCards } from '../lib/packs.js';
import {
  advanceDeck,
  createDeckState,
  drawCurrent,
  filterCards,
  type DeckState,
} from '../lib/deck.js';

const SESSION_KEY = 'charades-session';

const DEFAULT_GENERATIONS: Generation[] = [...ALL_GENERATIONS];

function normalizeSessionConfig(raw: unknown): CharadesSessionConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const parsed = raw as Partial<CharadesSessionConfig> & { packId?: string };
  const packIds =
    Array.isArray(parsed.packIds) && parsed.packIds.length > 0
      ? parsed.packIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
      : typeof parsed.packId === 'string' && parsed.packId.length > 0
        ? [parsed.packId]
        : [];
  if (packIds.length === 0 || !parsed.difficulty || !parsed.enabledTypes?.length) return null;

  return {
    packIds,
    multiPack: Boolean(parsed.multiPack ?? packIds.length > 1),
    difficulty: parsed.difficulty,
    enabledGenerations: parsed.enabledGenerations?.length
      ? parsed.enabledGenerations
      : DEFAULT_GENERATIONS,
    enabledTypes: parsed.enabledTypes,
  };
}

function loadSessionConfig(): CharadesSessionConfig | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return normalizeSessionConfig(JSON.parse(raw));
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

function typesForPackIds(packIds: string[]): CardType[] {
  const packs = getPacksByIds(packIds);
  if (packs.length === 0) return [];
  if (packs.length === 1) return getTypesInPack(packs[0]);
  return getTypesInPacks(packs);
}

export function useCharadesSetup() {
  const [multiPack, setMultiPack] = useState(false);
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [enabledGenerations, setEnabledGenerations] = useState<Generation[]>(DEFAULT_GENERATIONS);
  const [enabledTypes, setEnabledTypes] = useState<CardType[]>([]);

  const selectedPacks = useMemo(() => getPacksByIds(selectedPackIds), [selectedPackIds]);
  const availableTypes = useMemo(() => typesForPackIds(selectedPackIds), [selectedPackIds]);

  const selectPack = useCallback((id: string) => {
    setSelectedPackIds([id]);
    const pack = getPacksByIds([id])[0];
    setEnabledTypes(pack ? getTypesInPack(pack) : []);
  }, []);

  const togglePack = useCallback((id: string) => {
    setSelectedPackIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        const next = prev.filter((packId) => packId !== id);
        setEnabledTypes((types) => types.filter((type) => typesForPackIds(next).includes(type)));
        return next;
      }
      const next = [...prev, id];
      setEnabledTypes(typesForPackIds(next));
      return next;
    });
  }, []);

  const handlePackPress = useCallback(
    (id: string) => {
      if (multiPack) togglePack(id);
      else selectPack(id);
    },
    [multiPack, selectPack, togglePack],
  );

  const setMultiPackMode = useCallback((enabled: boolean) => {
    setMultiPack(enabled);
    if (!enabled) {
      setSelectedPackIds((prev) => {
        const next = prev.length > 0 ? [prev[0]] : [];
        const pack = next[0] ? getPacksByIds([next[0]])[0] : undefined;
        setEnabledTypes(pack ? getTypesInPack(pack) : []);
        return next;
      });
    }
  }, []);

  const mergedCards = useMemo(() => mergePackCards(selectedPackIds), [selectedPackIds]);

  const filteredCount = useMemo(() => {
    if (
      selectedPackIds.length === 0 ||
      enabledTypes.length === 0 ||
      enabledGenerations.length === 0
    ) {
      return 0;
    }
    return filterCards(mergedCards, {
      difficulty,
      types: enabledTypes,
      generations: enabledGenerations,
    }).length;
  }, [mergedCards, selectedPackIds.length, difficulty, enabledTypes, enabledGenerations]);

  const canStart = selectedPackIds.length > 0 && filteredCount > 0;

  const roundTitle = useMemo(() => formatRoundTitle(selectedPackIds), [selectedPackIds]);

  const startSession = useCallback(() => {
    if (!canStart) return null;
    const config: CharadesSessionConfig = {
      packIds: selectedPackIds,
      multiPack,
      difficulty,
      enabledGenerations,
      enabledTypes,
    };
    saveSessionConfig(config);
    return config;
  }, [selectedPackIds, multiPack, difficulty, enabledGenerations, enabledTypes, canStart]);

  const toggleGeneration = useCallback((generation: Generation) => {
    setEnabledGenerations((prev) => {
      if (prev.includes(generation)) {
        if (prev.length <= 1) return prev;
        return prev.filter((g) => g !== generation);
      }
      return [...prev, generation];
    });
  }, []);

  const toggleType = useCallback((type: CardType) => {
    setEnabledTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length <= 1) return prev;
        return prev.filter((t) => t !== type);
      }
      return [...prev, type];
    });
  }, []);

  return {
    multiPack,
    setMultiPackMode,
    selectedPackIds,
    handlePackPress,
    difficulty,
    setDifficulty,
    selectedPacks,
    roundTitle,
    enabledGenerations,
    toggleGeneration,
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
  const roundTitle = config ? formatRoundTitle(config.packIds) : 'Charades';
  const mergedCards = config ? mergePackCards(config.packIds) : [];

  const [deckState, setDeckState] = useState<DeckState | null>(() => {
    if (!config || mergedCards.length === 0) return null;
    return createDeckState(mergedCards, {
      difficulty: config.difficulty,
      types: config.enabledTypes,
      generations: config.enabledGenerations,
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
    roundTitle,
    currentCard,
    revealed,
    reveal,
    nextCard,
    revealOrNext,
    isReady: Boolean(config && mergedCards.length > 0 && deckState && currentCard),
  };
}
