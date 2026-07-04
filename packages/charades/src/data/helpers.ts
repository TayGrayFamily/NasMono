import type { CardType, CharadesCard, Difficulty } from '../types.js';

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
  difficulty: Difficulty,
  extra?: CardExtras,
): CharadesCard {
  return { id, text, type, difficulty, ...extra };
}
