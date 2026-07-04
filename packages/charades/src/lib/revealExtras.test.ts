import { describe, expect, it } from 'vitest';
import { card } from '../data/helpers.js';
import {
  cardHasImageSource,
  getAvailableRevealExtras,
  getCardContext,
  getCardImageSearch,
} from './revealExtras.js';

describe('revealExtras', () => {
  it('falls back to actHint as context', () => {
    const sample = card('q-1', 'Hello there', 'quote', 'easy', { actHint: 'Star Wars' });
    expect(getCardContext(sample)).toBe('Star Wars');
    expect(getAvailableRevealExtras(sample)).toContain('context');
    expect(getCardImageSearch(sample)).toBe('Star Wars');
    expect(cardHasImageSource(sample)).toBe(true);
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

  it('infers image search for actors and titles', () => {
    expect(getCardImageSearch(card('a-1', 'Tom Hanks', 'actor', 'easy'))).toBe('Tom Hanks actor');
    expect(getCardImageSearch(card('t-1', 'Jurassic Park', 'title', 'medium'))).toBe(
      'Jurassic Park',
    );
  });

  it('infers image search for characters using source material', () => {
    expect(
      getCardImageSearch(card('c-1', 'Woody', 'character', 'easy', { context: 'Toy Story' })),
    ).toBe('Woody Toy Story');
    expect(getCardImageSearch(card('c-2', 'Goku', 'person', 'easy'))).toBe('Goku');
  });

  it('prefers explicit imageSearch over inference', () => {
    expect(
      getCardImageSearch(
        card('c-1', 'Elsa', 'character', 'easy', {
          context: 'Frozen',
          imageSearch: 'elsa frozen disney',
        }),
      ),
    ).toBe('elsa frozen disney');
  });

  it('does not infer images for word cards', () => {
    const sample = card('w-1', 'Elephant', 'word', 'easy');
    expect(getCardImageSearch(sample)).toBeUndefined();
    expect(cardHasImageSource(sample)).toBe(false);
  });

  it('infers images for anime and video game character cards', async () => {
    const { animePack } = await import('../data/anime.js');
    const { videoGameCharactersPack } = await import('../data/video-game-characters.js');

    for (const characterCard of [
      ...animePack.cards.filter((c) => c.type === 'character'),
      ...videoGameCharactersPack.cards,
    ]) {
      expect(cardHasImageSource(characterCard)).toBe(true);
    }
  });

  it('movies pack exposes images on titles, characters, actors, and quotes', async () => {
    const { moviesPack } = await import('../data/movies.js');
    const visualTypes = new Set(['title', 'quote', 'character', 'actor']);

    for (const movieCard of moviesPack.cards.filter((c) => visualTypes.has(c.type))) {
      expect(cardHasImageSource(movieCard)).toBe(true);
    }
  });
});
