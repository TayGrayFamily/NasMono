export type CardType = 'word' | 'term' | 'quote' | 'person' | 'title' | 'character' | 'actor';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Generation = 'gen-alpha' | 'gen-z' | 'millennial' | 'gen-x-plus';

export type RevealExtraKey = 'image' | 'context' | 'guessHint' | 'definition';

export interface CharadesCard {
  id: string;
  text: string;
  type: CardType;
  difficulty: Difficulty;
  /** Set when packs are merged at runtime — used for next-card pack filters. */
  packId?: string;
  /** Optional clue on the revealed card (legacy — prefer `context` for source material). */
  actHint?: string;
  /** Who is likely to know this reference. Omit on universal cards (animals, actions, …). */
  generations?: Generation[];
  /** Source or background shown in the Context chip (e.g. film title, era). */
  context?: string;
  /** Softer nudge for guessers when acting stalls. */
  guessHint?: string;
  /** Short definition for terms, jobs, places, etc. */
  definition?: string;
  /** Lightweight visual with no network request. */
  emoji?: string;
  /** Bundled or resolved still image URL. */
  imageUrl?: string;
  imageAlt?: string;
  /** Giphy GIF id — resolved via API when no `imageUrl`. */
  giphyId?: string;
  /** Giphy search query — lazy-loaded on reveal when no static image. */
  imageSearch?: string;
}

export interface CharadesPack {
  id: string;
  name: string;
  description: string;
  ageMin: number;
  ageMax: number | null;
  cards: CharadesCard[];
}

export interface CharadesSessionConfig {
  packIds: string[];
  multiPack: boolean;
  enabledDifficulties: Difficulty[];
  enabledGenerations: Generation[];
  enabledTypes: CardType[];
}

export interface NextCardPick {
  difficulties: Difficulty[];
  packIds: string[];
}
