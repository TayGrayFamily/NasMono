import type { CardType, CharadesCard, Difficulty } from '../types.js';

export function card(
  id: string,
  text: string,
  type: CardType,
  difficulty: Difficulty,
  extra?: Pick<CharadesCard, 'actHint' | 'generations'>,
): CharadesCard {
  return { id, text, type, difficulty, ...extra };
}
