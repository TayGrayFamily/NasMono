import { describe, expect, it } from 'vitest';
import { card } from '../data/helpers.js';
import {
  averageDifficulty,
  bandSharePercent,
  cardMatchesBand,
  difficultyHistogram,
  filterByBands,
} from './difficultyBands.js';

describe('difficultyBands', () => {
  const samples = [
    card('a', 'Easy one', 'word', 2),
    card('b', 'Overlap easy/normal', 'word', 4),
    card('c', 'Normal', 'word', 6),
    card('d', 'Overlap normal/hard', 'word', 7),
    card('e', 'Hard', 'word', 9),
  ];

  it('matches overlapping bands at levels 4 and 7', () => {
    expect(cardMatchesBand(samples[1]!, 'easy')).toBe(true);
    expect(cardMatchesBand(samples[1]!, 'medium')).toBe(true);
    expect(cardMatchesBand(samples[3]!, 'medium')).toBe(true);
    expect(cardMatchesBand(samples[3]!, 'hard')).toBe(true);
  });

  it('filters by selected bands', () => {
    const normalOnly = filterByBands(samples, ['medium']);
    expect(normalOnly.map((c) => c.id)).toEqual(['b', 'c', 'd']);
  });

  it('computes average difficulty', () => {
    expect(averageDifficulty(samples)).toBe(5.6);
    expect(averageDifficulty([])).toBeNull();
  });

  it('builds histogram across levels 1-10', () => {
    const histogram = difficultyHistogram(samples);
    expect(histogram).toHaveLength(10);
    expect(histogram[1]).toBe(1);
    expect(histogram[3]).toBe(1);
    expect(histogram[5]).toBe(1);
    expect(histogram[6]).toBe(1);
    expect(histogram[8]).toBe(1);
  });

  it('reports band share percentages with overlap', () => {
    expect(bandSharePercent(samples, 'easy')).toBe(40);
    expect(bandSharePercent(samples, 'medium')).toBe(60);
    expect(bandSharePercent(samples, 'hard')).toBe(40);
  });
});
