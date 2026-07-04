import type { Difficulty } from '../types.js';

export const ALL_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Normal',
  hard: 'Hard',
};

export function formatDifficultyLabel(level: Difficulty): string {
  return DIFFICULTY_LABELS[level];
}

export function formatDifficultySummary(difficulties: Difficulty[]): string {
  if (difficulties.length === ALL_DIFFICULTIES.length) return 'All difficulties';
  return difficulties.map(formatDifficultyLabel).join(', ');
}
