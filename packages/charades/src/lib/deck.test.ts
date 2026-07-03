import { describe, expect, it } from 'vitest';
import { allPacks } from '../data/index.js';
import { validatePack } from '../schema.js';
import type { Difficulty } from '../types.js';
import {
  advanceDeck,
  createDeckState,
  createShuffledDeck,
  drawCurrent,
  filterByDifficulty,
  shuffleDeck,
} from './deck.js';

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

describe('deck', () => {
  it('filters cards by difficulty', () => {
    const pack = allPacks[0];
    const easy = filterByDifficulty(pack.cards, 'easy');
    expect(easy.length).toBeGreaterThan(0);
    expect(easy.every((card) => card.difficulty === 'easy')).toBe(true);
  });

  it('shuffles deterministically with a seeded rng', () => {
    const pack = allPacks[0];
    const first = createShuffledDeck(pack.cards, 'easy', seededRandom(42));
    const second = createShuffledDeck(pack.cards, 'easy', seededRandom(42));
    expect(first.map((c) => c.id)).toEqual(second.map((c) => c.id));
  });

  it('draws and advances without repeating until deck is exhausted', () => {
    const pack = allPacks[0];
    let state = createDeckState(pack.cards, 'easy', seededRandom(7));
    const seen = new Set<string>();

    for (let i = 0; i < state.deck.length; i += 1) {
      const current = drawCurrent(state);
      expect(current).not.toBeNull();
      expect(seen.has(current!.id)).toBe(false);
      seen.add(current!.id);
      state = advanceDeck(state);
    }

    expect(drawCurrent(state)?.id).toBeDefined();
  });

  it('reshuffles when the deck is exhausted', () => {
    const cards = allPacks[0].cards.filter((c) => c.difficulty === 'easy').slice(0, 3);
    let state = { deck: shuffleDeck(cards, seededRandom(1)), index: 3 };
    state = advanceDeck(state);
    expect(state.index).toBe(0);
    expect(state.deck).toHaveLength(3);
  });
});

describe('pack data', () => {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  it('validates every pack with zod', () => {
    for (const pack of allPacks) {
      expect(() => validatePack(pack)).not.toThrow();
    }
  });

  it('has at least 50 cards per pack and 15 per difficulty tier', () => {
    for (const pack of allPacks) {
      expect(pack.cards.length).toBeGreaterThanOrEqual(50);

      for (const difficulty of difficulties) {
        const count = pack.cards.filter((card) => card.difficulty === difficulty).length;
        expect(count).toBeGreaterThanOrEqual(15);
      }
    }
  });

  it('uses unique card ids within each pack', () => {
    for (const pack of allPacks) {
      const ids = pack.cards.map((card) => card.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
