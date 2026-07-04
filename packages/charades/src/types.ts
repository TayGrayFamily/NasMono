export type CardType = 'word' | 'term' | 'quote' | 'person' | 'title' | 'character' | 'actor';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Generation = 'gen-alpha' | 'gen-z' | 'millennial' | 'gen-x-plus';

export interface CharadesCard {
  id: string;
  text: string;
  type: CardType;
  difficulty: Difficulty;
  /** Optional clue on the revealed card (e.g. source film). */
  actHint?: string;
  /** Who is likely to know this reference. Omit on universal cards (animals, actions, …). */
  generations?: Generation[];
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
  packId: string;
  difficulty: Difficulty;
  enabledGenerations: Generation[];
  enabledTypes: CardType[];
}
