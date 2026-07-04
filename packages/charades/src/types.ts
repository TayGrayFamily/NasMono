export type CardType = 'word' | 'term' | 'quote' | 'person' | 'title' | 'character' | 'actor';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Generation = 'gen-alpha' | 'gen-z' | 'millennial' | 'gen-x-plus';

export interface CharadesCard {
  id: string;
  text: string;
  type: CardType;
  difficulty: Difficulty;
  year?: number;
  actHint?: string;
  /** When omitted after load, the card is suitable for every generation. */
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
