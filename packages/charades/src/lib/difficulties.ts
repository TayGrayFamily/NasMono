import type { CharadesCard } from '../types.js';
import type { DifficultyBand } from './difficultyBands.js';
import {
  ALL_DIFFICULTY_BANDS,
  bandsPresentInCards,
  filterByBands,
  isAllDifficultiesSelection as isAllBandsSelection,
} from './difficultyBands.js';

export type { DifficultyBand };

export const ALL_DIFFICULTIES: DifficultyBand[] = ALL_DIFFICULTY_BANDS;

export const DIFFICULTY_LABELS: Record<DifficultyBand, string> = {
  easy: 'Easy',
  medium: 'Normal',
  hard: 'Hard',
};

/** Play / pick: draw from any difficulty enabled for this round. */
export const ANY_DIFFICULTY = 'all' as const;
export type DifficultyChoice = DifficultyBand | typeof ANY_DIFFICULTY;

export const ANY_DIFFICULTY_LABEL = 'Any';

export function formatDifficultyLabel(level: DifficultyBand): string {
  return DIFFICULTY_LABELS[level];
}

export function difficultiesPresentInCards(
  cards: readonly Pick<CharadesCard, 'difficulty'>[],
): DifficultyBand[] {
  return bandsPresentInCards(cards);
}

export function isAllDifficultiesSelection(
  selected: DifficultyBand[],
  available: DifficultyBand[] = ALL_DIFFICULTY_BANDS,
): boolean {
  return isAllBandsSelection(selected, available);
}

/** Coerce legacy multi-select subsets to all available difficulties. */
export function normalizeDifficultySelection(
  selected: DifficultyBand[],
  available: DifficultyBand[],
): DifficultyBand[] {
  if (available.length === 0) return [];
  const kept = selected.filter((level) => available.includes(level));
  if (kept.length === 1) return kept;
  if (isAllDifficultiesSelection(kept, available)) return [...available];
  return [...available];
}

export function formatDifficultySummary(
  difficulties: DifficultyBand[],
  available: DifficultyBand[] = ALL_DIFFICULTY_BANDS,
): string {
  if (isAllDifficultiesSelection(difficulties, available)) return 'All difficulties';
  if (difficulties.length === 1) return formatDifficultyLabel(difficulties[0]!);
  return 'All difficulties';
}

export function formatPickDifficultyLabel(choice: DifficultyChoice | null): string {
  if (choice === null) return 'Difficulty';
  if (choice === ANY_DIFFICULTY) return ANY_DIFFICULTY_LABEL;
  return formatDifficultyLabel(choice);
}

export { filterByBands };
