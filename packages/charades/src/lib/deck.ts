import type { CardType, CharadesCard, Difficulty, Generation } from '../types.js';
import type { NextCardPick } from '../types.js';
import { cardMatchesGenerations } from './generations.js';

export interface DeckFilter {
  difficulties: Difficulty[];
  types: CardType[];
  generations: Generation[];
}

export function filterByDifficulty(cards: CharadesCard[], difficulty: Difficulty): CharadesCard[] {
  return cards.filter((c) => c.difficulty === difficulty);
}

export function filterByDifficulties(
  cards: CharadesCard[],
  difficulties: Difficulty[],
): CharadesCard[] {
  const allowed = new Set(difficulties);
  return cards.filter((c) => allowed.has(c.difficulty));
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
    return { deck: shuffleDeck(state.deck), index: 0 };
  }
  return { ...state, index: nextIndex };
}

export function remainingCards(state: DeckState): number {
  return Math.max(0, state.deck.length - state.index);
}

export function cardMatchesPick(card: CharadesCard, pick: NextCardPick): boolean {
  if (pick.difficulties.length > 0 && !pick.difficulties.includes(card.difficulty)) {
    return false;
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

  const chosen = matches[Math.floor(random() * matches.length)]!;
  const chosenIndex = deck.findIndex((card, i) => i >= index && card.id === chosen.id);
  if (chosenIndex < 0 || chosenIndex === index) return state;

  const nextDeck = [...deck];
  [nextDeck[index], nextDeck[chosenIndex]] = [nextDeck[chosenIndex]!, nextDeck[index]!];
  return { deck: nextDeck, index };
}
