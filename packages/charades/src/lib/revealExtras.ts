import type { CardType, CharadesCard, RevealExtraKey } from '../types.js';
import { buildAnimeCharacterImageSearch, truncateGiphyQuery } from './giphyQuery.js';

const IMAGE_SEARCH_TYPES = new Set<CardType>(['title', 'quote', 'character', 'actor', 'person']);

export function getCardContext(card: CharadesCard): string | undefined {
  if (card.context) return card.context;
  if (card.actHint) return card.actHint;
  return undefined;
}

/** Giphy query for this card — explicit `imageSearch` or inferred from type, title, and source. */
export function getCardImageSearch(card: CharadesCard): string | undefined {
  if (card.imageSearch) return card.imageSearch;
  if (card.imageUrl || card.giphyId) return undefined;
  if (!IMAGE_SEARCH_TYPES.has(card.type)) return undefined;

  const source = getCardContext(card);

  if (card.type === 'quote') {
    return source;
  }

  if (card.type === 'actor') {
    return `${card.text} actor`;
  }

  if (card.type === 'title') {
    return card.text;
  }

  if (card.type === 'character') {
    if (card.packId === 'anime' && source) {
      return buildAnimeCharacterImageSearch(card.text, source);
    }
    if (source) {
      return truncateGiphyQuery(`${card.text} ${source}`);
    }
    return truncateGiphyQuery(card.text);
  }

  if (source) {
    return truncateGiphyQuery(`${card.text} ${source}`);
  }

  return truncateGiphyQuery(card.text);
}

export function cardHasImageSource(card: CharadesCard): boolean {
  return Boolean(card.imageUrl || card.giphyId || getCardImageSearch(card));
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
