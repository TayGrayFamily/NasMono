import { describe, expect, it } from 'vitest';
import { formatRoundTitle, getTypesInPacks, mergePackCards } from './packs.js';
import { getPackById } from '../data/index.js';

describe('packs', () => {
  it('merges cards from multiple pack ids', () => {
    const cards = mergePackCards(['animals', 'movies']);
    const animals = getPackById('animals');
    const movies = getPackById('movies');
    expect(cards.length).toBe((animals?.cards.length ?? 0) + (movies?.cards.length ?? 0));
  });

  it('stamps packId when merging cards', () => {
    const cards = mergePackCards(['animals', 'movies']);
    expect(cards.some((card) => card.packId === 'animals')).toBe(true);
    expect(cards.some((card) => card.packId === 'movies')).toBe(true);
  });

  it('unions card types across packs', () => {
    const packs = [getPackById('animals'), getPackById('movies')].filter(Boolean);
    const types = getTypesInPacks(packs as NonNullable<(typeof packs)[number]>[]);
    expect(types).toContain('word');
    expect(types).toContain('title');
    expect(types).toContain('quote');
  });

  it('formats a mixed round title', () => {
    expect(formatRoundTitle(['animals'])).toBe('Animals');
    expect(formatRoundTitle(['animals', 'movies', 'food-and-drink'])).toBe('Mixed · 3 packs');
  });
});
