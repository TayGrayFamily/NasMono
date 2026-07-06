import type { DifficultyBand } from './difficultyBands.js';
import { bandMidpoint } from './difficultyBands.js';

/** Hue 145 (green) → 0 (red) across levels 1–10. */
export function getDifficultyHue(level: number): number {
  const clamped = Math.min(10, Math.max(1, level));
  return 145 - ((clamped - 1) * 145) / 9;
}

export function getDifficultyColor(level: number): string {
  return `hsl(${getDifficultyHue(level)} 72% 48%)`;
}

export function getDifficultyCssVars(level: number): Record<string, string> {
  const color = getDifficultyColor(level);
  return {
    '--difficulty-color': color,
    '--difficulty-border': color,
    '--difficulty-bg': `hsla(${getDifficultyHue(level)} 72% 48% / 0.12)`,
  };
}

export function getBandColor(band: DifficultyBand): string {
  return getDifficultyColor(bandMidpoint(band));
}

export function getBandCssVars(band: DifficultyBand): Record<string, string> {
  const level = bandMidpoint(band);
  const color = getDifficultyColor(level);
  return {
    '--difficulty-color': color,
    '--difficulty-border': color,
    '--difficulty-bg': `hsla(${getDifficultyHue(level)} 72% 48% / 0.12)`,
  };
}
