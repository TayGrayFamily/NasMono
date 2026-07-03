export type CardType = 'word' | 'term' | 'quote' | 'person';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CharadesCard {
  id: string;
  text: string;
  type: CardType;
  difficulty: Difficulty;
  year?: number;
  actHint?: string;
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
}
