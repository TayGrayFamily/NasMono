import { describe, expect, it } from 'vitest';
import { card } from '../data/helpers.js';
import { cardHasImageSource, getAvailableRevealExtras, getCardContext } from './revealExtras.js';

describe('revealExtras', () => {
  it('falls back to actHint as context for quotes', () => {
    const sample = card('q-1', 'Hello there', 'quote', 'easy', { actHint: 'Star Wars' });
    expect(getCardContext(sample)).toBe('Star Wars');
    expect(getAvailableRevealExtras(sample)).toContain('context');
  });

  it('lists optional reveal chips when data is present', () => {
    const sample = card('t-1', 'Frozen', 'title', 'easy', {
      context: 'Disney, 2013',
      guessHint: 'Ice powers',
      definition: 'To freeze water',
      imageSearch: 'frozen elsa',
      emoji: '❄️',
    });

    expect(cardHasImageSource(sample)).toBe(true);
    expect(getAvailableRevealExtras(sample)).toEqual([
      'image',
      'context',
      'guessHint',
      'definition',
    ]);
  });
});
