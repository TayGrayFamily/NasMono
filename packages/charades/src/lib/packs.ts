import type { CardType, CharadesCard, CharadesPack } from '../types.js';
import { getPackById } from '../data/index.js';
import { getTypesInPack } from './cardTypes.js';

const TYPE_ORDER: CardType[] = ['title', 'quote', 'character', 'actor', 'person', 'word', 'term'];

export function getPacksByIds(packIds: string[]): CharadesPack[] {
  return packIds.map((id) => getPackById(id)).filter((pack): pack is CharadesPack => Boolean(pack));
}

export function mergePackCards(packIds: string[]): CharadesCard[] {
  const cards: CharadesCard[] = [];
  for (const pack of getPacksByIds(packIds)) {
    for (const card of pack.cards) {
      cards.push({ ...card, packId: pack.id });
    }
  }
  return cards;
}

export function getTypesInPacks(packs: CharadesPack[]): CardType[] {
  const found = new Set<CardType>();
  for (const pack of packs) {
    for (const type of getTypesInPack(pack)) {
      found.add(type);
    }
  }
  return TYPE_ORDER.filter((type) => found.has(type));
}

export function formatRoundTitle(packIds: string[]): string {
  if (packIds.length === 0) return 'Charades';
  if (packIds.length === 1) return getPackById(packIds[0])?.name ?? 'Charades';
  return `Mixed · ${packIds.length} packs`;
}
