import type { CardType, CharadesCard, DifficultyLevel } from '../types.js';

type CardExtras = Pick<
  CharadesCard,
  | 'packId'
  | 'actHint'
  | 'generations'
  | 'context'
  | 'guessHint'
  | 'definition'
  | 'emoji'
  | 'imageUrl'
  | 'imageAlt'
  | 'giphyId'
  | 'imageSearch'
>;

export function card(
  id: string,
  text: string,
  type: CardType,
  difficulty: DifficultyLevel,
  extra?: CardExtras,
): CharadesCard {
  return { id, text, type, difficulty, ...extra };
}
