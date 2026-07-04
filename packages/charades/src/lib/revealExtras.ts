import type { CharadesCard, RevealExtraKey } from '../types.js';

export function getCardContext(card: CharadesCard): string | undefined {
  if (card.context) return card.context;
  if (card.type === 'quote' && card.actHint) return card.actHint;
  return undefined;
}

export function cardHasImageSource(card: CharadesCard): boolean {
  return Boolean(card.imageUrl || card.giphyId || card.imageSearch);
}

export function getAvailableRevealExtras(card: CharadesCard): RevealExtraKey[] {
  const extras: RevealExtraKey[] = [];
  if (cardHasImageSource(card)) extras.push('image');
  if (getCardContext(card)) extras.push('context');
  if (card.guessHint) extras.push('guessHint');
  if (card.definition) extras.push('definition');
  return extras;
}

export const REVEAL_EXTRA_LABELS: Record<RevealExtraKey, string> = {
  image: 'Image',
  context: 'Context',
  guessHint: 'Hint',
  definition: 'Definition',
};
