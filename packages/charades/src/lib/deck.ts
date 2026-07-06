import type { CardType, CharadesCard, Generation } from '../types.js';
import type { DifficultyBand } from './difficultyBands.js';
import type { NextCardPick } from '../types.js';
import { cardMatchesBand, filterByBands } from './difficultyBands.js';
import { cardMatchesGenerations } from './generations.js';
import { loadRecentCardIds, preferUnseenCards, rememberCardId } from './recentCards.js';

export interface DeckFilter {
  difficulties: DifficultyBand[];
  types: CardType[];
  generations: Generation[];
}

export function filterByDifficulty(
  cards: CharadesCard[],
  difficulty: DifficultyBand,
): CharadesCard[] {
  return filterByBands(cards, [difficulty]);
}

export function filterByDifficulties(
  cards: CharadesCard[],
  difficulties: DifficultyBand[],
): CharadesCard[] {
  return filterByBands(cards, difficulties);
}

export function filterByTypes(cards: CharadesCard[], types: CardType[]): CharadesCard[] {
  const allowed = new Set(types);
  return cards.filter((c) => allowed.has(c.type));
}

export function filterByGenerations(
  cards: CharadesCard[],
  generations: Generation[],
): CharadesCard[] {
  return cards.filter((card) => cardMatchesGenerations(card, generations));
}

export function filterCards(cards: CharadesCard[], filter: DeckFilter): CharadesCard[] {
  return filterByGenerations(
    filterByTypes(filterByDifficulties(cards, filter.difficulties), filter.types),
    filter.generations,
  );
}

export function shuffleDeck<T>(items: T[], random: () => number = Math.random): T[] {
  const deck = [...items];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function createShuffledDeck(
  cards: CharadesCard[],
  filter: DeckFilter,
  random: () => number = Math.random,
): CharadesCard[] {
  return shuffleDeck(filterCards(cards, filter), random);
}

export interface DeckState {
  deck: CharadesCard[];
  index: number;
}

export function createDeckState(
  cards: CharadesCard[],
  filter: DeckFilter,
  random?: () => number,
): DeckState {
  return {
    deck: createShuffledDeck(cards, filter, random),
    index: 0,
  };
}

export function drawCurrent(state: DeckState): CharadesCard | null {
  if (state.index >= state.deck.length) return null;
  return state.deck[state.index] ?? null;
}

export function advanceDeck(state: DeckState): DeckState {
  const nextIndex = state.index + 1;
  if (nextIndex >= state.deck.length) {
    const lastPlayedIndex = Math.min(state.index, state.deck.length - 1);
    const lastPlayed = state.deck[lastPlayedIndex];
    let deck = shuffleDeck(state.deck);
    if (lastPlayed && deck.length > 1 && deck[0]?.id === lastPlayed.id) {
      deck = [...deck];
      [deck[0], deck[1]] = [deck[1]!, deck[0]!];
    }
    return { deck, index: 0 };
  }
  return { ...state, index: nextIndex };
}

export function remainingCards(state: DeckState): number {
  return Math.max(0, state.deck.length - state.index);
}

export function cardMatchesPick(card: CharadesCard, pick: NextCardPick): boolean {
  if (pick.difficulties.length > 0) {
    const matchesBand = pick.difficulties.some((band) => cardMatchesBand(card, band));
    if (!matchesBand) return false;
  }
  if (pick.packIds.length > 0) {
    if (!card.packId || !pick.packIds.includes(card.packId)) return false;
  }
  return true;
}

export function applyNextCardPick(
  state: DeckState,
  pick: NextCardPick,
  random: () => number = Math.random,
): DeckState {
  const { deck, index } = state;
  const remaining = deck.slice(index);
  const matches = remaining.filter((card) => cardMatchesPick(card, pick));
  if (matches.length === 0) return state;

  const pool = preferUnseenCards(matches, loadRecentCardIds());
  const chosen = pool[Math.floor(random() * pool.length)]!;
  rememberCardId(chosen.id);
  const chosenIndex = deck.findIndex((card, i) => i >= index && card.id === chosen.id);
  if (chosenIndex < 0 || chosenIndex === index) return state;

  const nextDeck = [...deck];
  [nextDeck[index], nextDeck[chosenIndex]] = [nextDeck[chosenIndex]!, nextDeck[index]!];
  return { deck: nextDeck, index };
}
