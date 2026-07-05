import type { CharadesCard, Difficulty } from '../types.js';

export const ALL_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Normal',
  hard: 'Hard',
};

/** Play / pick: draw from any difficulty enabled for this round. */
export const ANY_DIFFICULTY = 'all' as const;
export type DifficultyChoice = Difficulty | typeof ANY_DIFFICULTY;

export const ANY_DIFFICULTY_LABEL = 'Any';

export function formatDifficultyLabel(level: Difficulty): string {
  return DIFFICULTY_LABELS[level];
}

export function difficultiesPresentInCards(
  cards: readonly Pick<CharadesCard, 'difficulty'>[],
): Difficulty[] {
  const present = new Set(cards.map((card) => card.difficulty));
  return ALL_DIFFICULTIES.filter((level) => present.has(level));
}

export function isAllDifficultiesSelection(
  selected: Difficulty[],
  available: Difficulty[] = ALL_DIFFICULTIES,
): boolean {
  return (
    available.length > 0 &&
    selected.length === available.length &&
    available.every((level) => selected.includes(level))
  );
}

/** Coerce legacy multi-select subsets to all available difficulties. */
export function normalizeDifficultySelection(
  selected: Difficulty[],
  available: Difficulty[],
): Difficulty[] {
  if (available.length === 0) return [];
  const kept = selected.filter((level) => available.includes(level));
  if (kept.length === 1) return kept;
  if (isAllDifficultiesSelection(kept, available)) return [...available];
  return [...available];
}

export function formatDifficultySummary(
  difficulties: Difficulty[],
  available: Difficulty[] = ALL_DIFFICULTIES,
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
