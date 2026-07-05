import { describe, expect, it } from 'vitest';
import { card } from '../data/helpers.js';
import {
  advanceDeck,
  applyNextCardPick,
  cardMatchesPick,
  createDeckState,
  createShuffledDeck,
  drawCurrent,
  filterByDifficulties,
  filterByDifficulty,
  filterByGenerations,
  filterByTypes,
  filterCards,
  shuffleDeck,
} from './deck.js';
import { cardMatchesBand } from './difficultyBands.js';
import { allPacks, getPackById } from '../data/index.js';
import { validatePack } from '../schema.js';
import type { CardType } from '../types.js';
import { getTypesInPack } from './cardTypes.js';
import { ALL_GENERATIONS } from './generations.js';

const allGens = [...ALL_GENERATIONS];

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

describe('deck', () => {
  it('filters cards by difficulty band', () => {
    const pack = allPacks[0];
    const easy = filterByDifficulty(pack.cards, 'easy');
    expect(easy.length).toBeGreaterThan(0);
    expect(easy.every((c) => cardMatchesBand(c, 'easy'))).toBe(true);
  });

  it('filters cards by type', () => {
    const movies = getPackById('movies');
    expect(movies).toBeDefined();
    const titles = filterByTypes(movies!.cards, ['title']);
    expect(titles.length).toBeGreaterThan(0);
    expect(titles.every((card) => card.type === 'title')).toBe(true);
  });

  it('filters cards by generation', () => {
    const movies = getPackById('movies')!;
    const genAlphaOnly = filterByGenerations(movies.cards, ['gen-alpha']);
    const allSelected = filterByGenerations(movies.cards, allGens);
    expect(genAlphaOnly.length).toBeLessThan(allSelected.length);
    expect(genAlphaOnly.every((card) => cardMatchesGenAlpha(card))).toBe(true);
  });

  it('filters cards by multiple difficulty bands with overlap', () => {
    const pack = allPacks[0];
    const filtered = filterByDifficulties(pack.cards, ['easy', 'hard']);
    expect(filtered.length).toBeGreaterThan(0);
    expect(
      filtered.every((card) => cardMatchesBand(card, 'easy') || cardMatchesBand(card, 'hard')),
    ).toBe(true);
  });

  it('filters by difficulty, types, and generations together', () => {
    const movies = getPackById('movies')!;
    const filtered = filterCards(movies.cards, {
      difficulties: ['easy'],
      types: ['actor'],
      generations: allGens,
    });
    expect(filtered.every((c) => cardMatchesBand(c, 'easy') && c.type === 'actor')).toBe(true);
  });

  it('shuffles deterministically with a seeded rng', () => {
    const pack = allPacks[0];
    const first = createShuffledDeck(
      pack.cards,
      { difficulties: ['easy'], types: getTypesInPack(pack), generations: allGens },
      seededRandom(42),
    );
    const second = createShuffledDeck(
      pack.cards,
      { difficulties: ['easy'], types: getTypesInPack(pack), generations: allGens },
      seededRandom(42),
    );
    expect(first.map((c) => c.id)).toEqual(second.map((c) => c.id));
  });

  it('draws and advances without repeating until deck is exhausted', () => {
    const pack = allPacks[0];
    let state = createDeckState(
      pack.cards,
      { difficulties: ['easy'], types: getTypesInPack(pack), generations: allGens },
      seededRandom(7),
    );
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

  it('applies next-card pick by difficulty band and pack', () => {
    const movies = getPackById('movies')!;
    const animals = getPackById('animals')!;
    const easyAnimal = animals.cards.find((c) => cardMatchesBand(c, 'easy'))!;
    const hardMovie = movies.cards.find((c) => cardMatchesBand(c, 'hard'))!;
    const state = {
      deck: [
        { ...easyAnimal, packId: 'animals' },
        { ...hardMovie, packId: 'movies' },
      ],
      index: 0,
    };
    const next = applyNextCardPick(state, { difficulties: ['hard'], packIds: ['movies'] }, () => 0);
    const picked = drawCurrent(next)!;
    expect(picked.id).toBe(hardMovie.id);
    expect(cardMatchesBand(picked, 'hard')).toBe(true);
    expect(picked.packId).toBe('movies');
  });

  it('cardMatchesPick respects empty pack filter', () => {
    const sample = { ...allPacks[0].cards[0], packId: 'animals' };
    expect(cardMatchesPick(sample, { difficulties: ['easy'], packIds: [] })).toBe(true);
    if (cardMatchesBand(sample, 'hard') && !cardMatchesBand(sample, 'easy')) {
      expect(cardMatchesPick(sample, { difficulties: ['hard'], packIds: [] })).toBe(true);
    }
  });

  it('reshuffles when the deck is exhausted and avoids immediate repeat', () => {
    const cards = allPacks[0].cards.filter((c) => cardMatchesBand(c, 'easy')).slice(0, 3);
    let state = { deck: shuffleDeck(cards, seededRandom(1)), index: 2 };
    const lastPlayed = drawCurrent(state)!;
    state = advanceDeck(state);
    expect(state.index).toBe(0);
    expect(state.deck).toHaveLength(3);
    expect(drawCurrent(state)?.id).not.toBe(lastPlayed.id);
  });
});

describe('pack data', () => {
  it('validates every pack with zod', () => {
    for (const pack of allPacks) {
      expect(() => validatePack(pack)).not.toThrow();
    }
  });

  it('has at least one card per pack', () => {
    for (const pack of allPacks) {
      expect(pack.cards.length).toBeGreaterThan(0);
    }
  });

  it('uses unique card ids within each pack', () => {
    for (const pack of allPacks) {
      const ids = pack.cards.map((card) => card.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('movies pack has hundreds of cards with strong normal-band coverage', () => {
    const movies = getPackById('movies')!;
    const normal = movies.cards.filter((c) => cardMatchesBand(c, 'medium'));
    expect(movies.cards.length).toBeGreaterThanOrEqual(400);
    expect(normal.length).toBeGreaterThanOrEqual(200);
  });

  it('movies pack supports turning off actors while keeping enough easy cards', () => {
    const movies = getPackById('movies')!;
    const withoutActors = filterCards(movies.cards, {
      difficulties: ['easy'],
      types: ['title', 'quote', 'character'],
      generations: allGens,
    });
    expect(withoutActors.length).toBeGreaterThanOrEqual(15);
  });

  it('gen-alpha filter excludes pre-1970 movie quotes', () => {
    const movies = getPackById('movies')!;
    const filtered = filterCards(movies.cards, {
      difficulties: ['hard'],
      types: ['quote'],
      generations: ['gen-alpha'],
    });
    const texts = filtered.map((card) => card.text);
    expect(texts).not.toContain('Rosebud');
    expect(texts).not.toContain('Frankly, my dear, I do not give a damn');
  });
});

describe('cardTypes', () => {
  it('movies pack exposes all four toggleable types', () => {
    const movies = getPackById('movies')!;
    const types = getTypesInPack(movies);
    const expected: CardType[] = ['title', 'quote', 'character', 'actor'];
    expect(types).toEqual(expected);
  });
});

function cardMatchesGenAlpha(card: { generations?: string[] }) {
  if (!card.generations?.length) return true;
  return card.generations.includes('gen-alpha');
}
