import { describe, expect, it } from 'vitest';
import { getPackById } from '../data/index.js';
import {
  ANY_DIFFICULTY,
  difficultiesPresentInCards,
  formatDifficultySummary,
  isAllDifficultiesSelection,
  normalizeDifficultySelection,
} from './difficulties.js';

describe('difficulties', () => {
  it('lists difficulties present in pack cards', () => {
    const animals = getPackById('animals')!;
    expect(difficultiesPresentInCards(animals.cards)).toEqual(['easy', 'medium', 'hard']);
  });

  it('detects all-difficulties selection against available set', () => {
    expect(isAllDifficultiesSelection(['easy', 'medium', 'hard'])).toBe(true);
    expect(isAllDifficultiesSelection(['easy'])).toBe(false);
    expect(isAllDifficultiesSelection(['easy', 'hard'])).toBe(false);
  });

  it('normalizes multi-select subsets to all available', () => {
    const available = ['easy', 'medium', 'hard'] as const;
    expect(normalizeDifficultySelection(['easy', 'hard'], [...available])).toEqual([
      'easy',
      'medium',
      'hard',
    ]);
    expect(normalizeDifficultySelection(['easy'], [...available])).toEqual(['easy']);
  });

  it('formats single, all, and legacy multi-select summaries', () => {
    expect(formatDifficultySummary(['hard'])).toBe('Hard');
    expect(formatDifficultySummary(['easy', 'medium', 'hard'])).toBe('All difficulties');
    expect(formatDifficultySummary(['easy', 'hard'])).toBe('All difficulties');
  });

  it('exports any difficulty sentinel', () => {
    expect(ANY_DIFFICULTY).toBe('all');
  });
});
