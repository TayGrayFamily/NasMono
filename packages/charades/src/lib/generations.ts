import type { CharadesCard, CharadesPack, Generation } from '../types.js';

export const ALL_GENERATIONS = [
  'gen-alpha',
  'gen-z',
  'millennial',
  'gen-x-plus',
] as const satisfies readonly Generation[];

export const GENERATION_LABELS: Record<Generation, string> = {
  'gen-alpha': 'Gen Alpha',
  'gen-z': 'Gen Z',
  millennial: 'Millennials',
  'gen-x-plus': 'Gen X+',
};

export const GENERATION_HINTS: Record<Generation, string> = {
  'gen-alpha': 'Kids & younger players',
  'gen-z': 'Teens & young adults',
  millennial: '90s–2000s culture',
  'gen-x-plus': 'Classic & older references',
};

/** Packs where cards are not tied to a specific era — omit generations (= all players). */
const UNIVERSAL_PACK_IDS = new Set([
  'actions',
  'animals',
  'around-the-house',
  'emotions',
  'food-and-drink',
  'jobs',
  'places',
  'sports',
]);

/**
 * Map a release year to generations likely to recognize the reference.
 * Pre-1970 classics skew older; most post-1970 pop culture is shared across ages.
 */
export function generationsFromYear(year: number): Generation[] {
  if (year < 1970) return ['millennial', 'gen-x-plus'];
  if (year < 2010) return ['gen-alpha', 'gen-z', 'millennial', 'gen-x-plus'];
  return ['gen-alpha', 'gen-z', 'millennial'];
}

export function inferCardGenerations(card: CharadesCard, packId: string): Generation[] | undefined {
  if (card.generations?.length) return card.generations;
  if (UNIVERSAL_PACK_IDS.has(packId)) return undefined;

  if (card.year !== undefined) return generationsFromYear(card.year);

  if (packId === 'disney' || packId === 'nintendo-games') {
    if (card.difficulty === 'hard') return ['gen-z', 'millennial', 'gen-x-plus'];
    return [...ALL_GENERATIONS];
  }

  if (packId === 'anime-characters' || packId === 'video-game-characters') {
    if (card.difficulty === 'hard') return ['gen-alpha', 'gen-z', 'millennial'];
    return [...ALL_GENERATIONS];
  }

  if (card.type === 'actor' && card.difficulty === 'hard') {
    return ['millennial', 'gen-x-plus'];
  }

  if (card.difficulty === 'easy') return [...ALL_GENERATIONS];
  if (card.difficulty === 'medium') return ['gen-alpha', 'gen-z', 'millennial', 'gen-x-plus'];

  return ['millennial', 'gen-x-plus'];
}

export function cardMatchesGenerations(card: CharadesCard, selected: Generation[]): boolean {
  if (!card.generations?.length) return true;
  const allowed = new Set(selected);
  return card.generations.some((generation) => allowed.has(generation));
}

/** Attach inferred generations when authoring omitted them. */
export function enrichPack(pack: CharadesPack): CharadesPack {
  return {
    ...pack,
    cards: pack.cards.map((card) => {
      const generations = inferCardGenerations(card, pack.id);
      if (!generations) return card;
      return { ...card, generations };
    }),
  };
}
