import type { Generation } from '../types.js';

/** Every generation — shared pop culture most ages know. */
export const GENS_ALL: Generation[] = ['gen-alpha', 'gen-z', 'millennial', 'gen-x-plus'];

/** Pre-1970 classics — skew older players. */
export const GENS_CLASSIC: Generation[] = ['millennial', 'gen-x-plus'];

/** 2010s+ — younger-skewing, still includes parents. */
export const GENS_RECENT: Generation[] = ['gen-alpha', 'gen-z', 'millennial'];
