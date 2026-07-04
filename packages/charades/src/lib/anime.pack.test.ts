import { describe, expect, it } from 'vitest';
import { getPackById } from '../data/index.js';
import { getTypesInPack } from '../lib/cardTypes.js';
import { validatePack } from '../schema.js';
import { animePack } from '../data/anime.js';

describe('anime pack', () => {
  it('validates with zod', () => {
    expect(() => validatePack(animePack)).not.toThrow();
  });

  it('exposes titles, quotes, and characters for pack filters', () => {
    const types = getTypesInPack(animePack);
    expect(types).toEqual(['title', 'quote', 'character']);
  });

  it('is registered under the anime id', () => {
    const pack = getPackById('anime');
    expect(pack?.name).toBe('Anime');
    expect(pack?.cards.length).toBeGreaterThan(50);
  });

  it('no longer registers the legacy anime-characters id', () => {
    expect(getPackById('anime-characters')).toBeUndefined();
  });
});
