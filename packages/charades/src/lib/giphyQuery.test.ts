import { describe, expect, it } from 'vitest';
import {
  buildAnimeCharacterImageSearch,
  meaningfulGiphyTerms,
  shortenAnimeSeries,
  truncateGiphyQuery,
} from './giphyQuery.js';

describe('giphyQuery', () => {
  it('shortens formal anime series titles for Giphy', () => {
    expect(shortenAnimeSeries('Puella Magi Madoka Magica')).toBe('Madoka Magica');
    expect(shortenAnimeSeries('Neon Genesis Evangelion')).toBe('Evangelion');
    expect(shortenAnimeSeries("JoJo's Bizarre Adventure")).toBe('JoJo');
  });

  it('builds compact English character queries without a generic anime tag', () => {
    expect(buildAnimeCharacterImageSearch('Madoka Kaname', 'Puella Magi Madoka Magica')).toBe(
      'Madoka Kaname Madoka Magica',
    );
  });

  it('truncates queries to the Giphy 50 character limit', () => {
    const long = 'A'.repeat(60);
    expect(truncateGiphyQuery(long).length).toBeLessThanOrEqual(50);
  });

  it('drops broad terms like anime from ranking tokens', () => {
    expect(meaningfulGiphyTerms('madoka kaname madoka magica anime')).toEqual([
      'madoka',
      'kaname',
      'magica',
    ]);
  });
});
