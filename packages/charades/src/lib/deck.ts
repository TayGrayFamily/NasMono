import type { CharadesCard, Difficulty } from '../types.js';

export function filterByDifficulty(cards: CharadesCard[], difficulty: Difficulty): CharadesCard[] {
  return cards.filter((c) => c.difficulty === difficulty);
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
  difficulty: Difficulty,
  random: () => number = Math.random,
): CharadesCard[] {
  return shuffleDeck(filterByDifficulty(cards, difficulty), random);
}

export interface DeckState {
  deck: CharadesCard[];
  index: number;
}

export function createDeckState(
  cards: CharadesCard[],
  difficulty: Difficulty,
  random?: () => number,
): DeckState {
  return {
    deck: createShuffledDeck(cards, difficulty, random),
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
