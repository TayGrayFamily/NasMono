import type { CharadesCard } from '../types.js';

/** UI/session filter bands — `medium` is labeled "Normal" in the UI. */
export type DifficultyBand = 'easy' | 'medium' | 'hard';

export const ALL_DIFFICULTY_BANDS: DifficultyBand[] = ['easy', 'medium', 'hard'];

export const DIFFICULTY_BANDS = {
  easy: { min: 1, max: 4 },
  medium: { min: 4, max: 7 },
  hard: { min: 7, max: 10 },
} as const satisfies Record<DifficultyBand, { min: number; max: number }>;

export function cardMatchesBand(
  card: Pick<CharadesCard, 'difficulty'>,
  band: DifficultyBand,
): boolean {
  const { min, max } = DIFFICULTY_BANDS[band];
  return card.difficulty >= min && card.difficulty <= max;
}

export function filterByBands(cards: CharadesCard[], bands: DifficultyBand[]): CharadesCard[] {
  if (bands.length === 0) return cards;
  return cards.filter((card) => bands.some((band) => cardMatchesBand(card, band)));
}

export function bandsPresentInCards(
  cards: readonly Pick<CharadesCard, 'difficulty'>[],
): DifficultyBand[] {
  return ALL_DIFFICULTY_BANDS.filter((band) => cards.some((card) => cardMatchesBand(card, band)));
}

export function averageDifficulty(
  cards: readonly Pick<CharadesCard, 'difficulty'>[],
): number | null {
  if (cards.length === 0) return null;
  const sum = cards.reduce((total, card) => total + card.difficulty, 0);
  return Math.round((sum / cards.length) * 10) / 10;
}

/** Count of cards at each difficulty level 1–10 (index 0 = level 1). */
export function difficultyHistogram(cards: readonly Pick<CharadesCard, 'difficulty'>[]): number[] {
  const counts = Array.from({ length: 10 }, () => 0);
  for (const card of cards) {
    const index = card.difficulty - 1;
    if (index >= 0 && index < 10) counts[index]! += 1;
  }
  return counts;
}

export function bandSharePercent(
  cards: readonly Pick<CharadesCard, 'difficulty'>[],
  band: DifficultyBand,
): number {
  if (cards.length === 0) return 0;
  const matching = cards.filter((card) => cardMatchesBand(card, band)).length;
  return Math.round((matching / cards.length) * 100);
}

export function bandMidpoint(band: DifficultyBand): number {
  const { min, max } = DIFFICULTY_BANDS[band];
  return (min + max) / 2;
}

export function isAllDifficultiesSelection(
  selected: DifficultyBand[],
  available: DifficultyBand[] = ALL_DIFFICULTY_BANDS,
): boolean {
  return (
    available.length > 0 &&
    selected.length === available.length &&
    available.every((band) => selected.includes(band))
  );
}
