import { useCallback, useMemo, useState } from 'react';
import type {
  CharadesSessionConfig,
  CharadesCard,
  CardType,
  Difficulty,
  Generation,
  NextCardPick,
} from '../types.js';
import { ALL_DIFFICULTIES } from '../lib/difficulties.js';
import { getTypesInPack } from '../lib/cardTypes.js';
import { ALL_GENERATIONS } from '../lib/generations.js';
import { getPackById } from '../data/index.js';
import { formatRoundTitle, getPacksByIds, getTypesInPacks, mergePackCards } from '../lib/packs.js';
import {
  advanceDeck,
  applyNextCardPick,
  createDeckState,
  drawCurrent,
  filterCards,
  type DeckState,
} from '../lib/deck.js';

const SESSION_KEY = 'charades-session';

const DEFAULT_GENERATIONS: Generation[] = [...ALL_GENERATIONS];
const DEFAULT_DIFFICULTIES: Difficulty[] = [...ALL_DIFFICULTIES];

const LEGACY_PACK_IDS: Record<string, string> = {
  'anime-characters': 'anime',
};

function normalizePackId(id: string): string {
  return LEGACY_PACK_IDS[id] ?? id;
}

function normalizePackIds(packIds: string[]): string[] {
  return packIds.map(normalizePackId);
}

function normalizeEnabledTypes(types: CardType[], packIds: string[]): CardType[] {
  if (!packIds.includes('anime') || !types.includes('person')) return types;

  const otherPacksNeedPerson = packIds.some((id) => {
    if (id === 'anime') return false;
    const pack = getPackById(id);
    return pack !== undefined && getTypesInPack(pack).includes('person');
  });

  if (otherPacksNeedPerson) {
    return types.includes('character') ? types : [...types, 'character'];
  }

  return types.map((type) => (type === 'person' ? 'character' : type));
}

function normalizeSessionConfig(raw: unknown): CharadesSessionConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const parsed = raw as Partial<CharadesSessionConfig> & {
    packId?: string;
    difficulty?: Difficulty;
  };
  const rawPackIds =
    Array.isArray(parsed.packIds) && parsed.packIds.length > 0
      ? parsed.packIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
      : typeof parsed.packId === 'string' && parsed.packId.length > 0
        ? [parsed.packId]
        : [];
  const packIds = normalizePackIds(rawPackIds);
  const enabledDifficulties = parsed.enabledDifficulties?.length
    ? parsed.enabledDifficulties
    : parsed.difficulty
      ? [parsed.difficulty]
      : DEFAULT_DIFFICULTIES;
  if (packIds.length === 0 || enabledDifficulties.length === 0 || !parsed.enabledTypes?.length) {
    return null;
  }

  return {
    packIds,
    multiPack: Boolean(parsed.multiPack ?? packIds.length > 1),
    enabledDifficulties,
    enabledGenerations: parsed.enabledGenerations?.length
      ? parsed.enabledGenerations
      : DEFAULT_GENERATIONS,
    enabledTypes: normalizeEnabledTypes(parsed.enabledTypes, packIds),
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
  const [enabledDifficulties, setEnabledDifficulties] =
    useState<Difficulty[]>(DEFAULT_DIFFICULTIES);
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
      enabledGenerations.length === 0 ||
      enabledDifficulties.length === 0
    ) {
      return 0;
    }
    return filterCards(mergedCards, {
      difficulties: enabledDifficulties,
      types: enabledTypes,
      generations: enabledGenerations,
    }).length;
  }, [mergedCards, selectedPackIds.length, enabledDifficulties, enabledTypes, enabledGenerations]);

  const canStart = selectedPackIds.length > 0 && filteredCount > 0;

  const roundTitle = useMemo(() => formatRoundTitle(selectedPackIds), [selectedPackIds]);

  const startSession = useCallback(() => {
    if (!canStart) return null;
    const config: CharadesSessionConfig = {
      packIds: selectedPackIds,
      multiPack,
      enabledDifficulties,
      enabledGenerations,
      enabledTypes,
    };
    saveSessionConfig(config);
    return config;
  }, [selectedPackIds, multiPack, enabledDifficulties, enabledGenerations, enabledTypes, canStart]);

  const toggleDifficulty = useCallback((difficulty: Difficulty) => {
    setEnabledDifficulties((prev) => {
      if (prev.includes(difficulty)) {
        if (prev.length <= 1) return prev;
        return prev.filter((level) => level !== difficulty);
      }
      return [...prev, difficulty];
    });
  }, []);

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
    enabledDifficulties,
    toggleDifficulty,
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
  const sessionPacks = config ? getPacksByIds(config.packIds) : [];

  const [deckState, setDeckState] = useState<DeckState | null>(() => {
    if (!config || mergedCards.length === 0) return null;
    return createDeckState(mergedCards, {
      difficulties: config.enabledDifficulties,
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

  const pickNextCard = useCallback((pick: NextCardPick) => {
    setDeckState((prev) => (prev ? applyNextCardPick(prev, pick) : prev));
  }, []);

  return {
    config,
    roundTitle,
    sessionPacks,
    currentCard,
    revealed,
    reveal,
    nextCard,
    pickNextCard,
    isReady: Boolean(config && mergedCards.length > 0 && deckState && currentCard),
  };
}
