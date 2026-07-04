import { describe, expect, it } from 'vitest';
import { getPackById } from '../data/index.js';
import {
  ALL_GENERATIONS,
  cardMatchesGenerations,
  generationsFromYear,
  inferCardGenerations,
} from './generations.js';

describe('generations', () => {
  it('maps pre-1970 releases to older generations', () => {
    expect(generationsFromYear(1941)).toEqual(['millennial', 'gen-x-plus']);
  });

  it('maps recent releases to younger generations', () => {
    expect(generationsFromYear(2018)).toEqual(['gen-alpha', 'gen-z', 'millennial']);
  });

  it('treats untagged universal pack cards as matching any selection', () => {
    const animals = getPackById('animals')!;
    const card = animals.cards[0];
    expect(card.generations).toBeUndefined();
    expect(cardMatchesGenerations(card, ['gen-alpha'])).toBe(true);
  });

  it('infers generations for classic movie quotes', () => {
    const movies = getPackById('movies')!;
    const rosebud = movies.cards.find((card) => card.text === 'Rosebud');
    expect(rosebud?.generations).toEqual(['millennial', 'gen-x-plus']);
    expect(cardMatchesGenerations(rosebud!, ['gen-alpha'])).toBe(false);
    expect(cardMatchesGenerations(rosebud!, ['millennial'])).toBe(true);
  });

  it('matches when any card generation overlaps the selection', () => {
    const movies = getPackById('movies')!;
    const frozen = movies.cards.find((card) => card.id === 'mov-t-001');
    expect(frozen?.generations).toEqual([...ALL_GENERATIONS]);
    expect(cardMatchesGenerations(frozen!, ['gen-alpha', 'gen-z'])).toBe(true);
  });

  it('leaves universal pack cards without generations', () => {
    const actions = getPackById('actions')!;
    expect(actions.cards.every((card) => card.generations === undefined)).toBe(true);
    expect(inferCardGenerations(actions.cards[0], 'actions')).toBeUndefined();
  });
});
