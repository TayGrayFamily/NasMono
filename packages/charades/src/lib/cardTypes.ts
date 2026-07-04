import type { CardType, CharadesPack } from '../types.js';

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  word: 'Words',
  term: 'Terms',
  quote: 'Quotes',
  person: 'People',
  title: 'Titles',
  character: 'Characters',
  actor: 'Actors',
};

export const CARD_TYPE_SINGULAR: Record<CardType, string> = {
  word: 'Word',
  term: 'Term',
  quote: 'Quote',
  person: 'Person',
  title: 'Title',
  character: 'Character',
  actor: 'Actor',
};

/** Short on-card guidance so players know how to act it out. */
export const CARD_TYPE_PLAY_HINT: Partial<Record<CardType, string>> = {
  actor: 'Imitate this celebrity',
  character: 'Act out this character',
  title: 'Mime the title',
  quote: 'Mouth the line silently',
  person: 'Act out this person',
  term: 'Act it out',
  word: 'Act it out',
};

const TYPE_ORDER: CardType[] = ['title', 'quote', 'character', 'actor', 'person', 'word', 'term'];

export function getTypesInPack(pack: CharadesPack): CardType[] {
  const found = new Set(pack.cards.map((card) => card.type));
  return TYPE_ORDER.filter((type) => found.has(type));
}

export function formatCardType(type: CardType): string {
  return CARD_TYPE_SINGULAR[type];
}
