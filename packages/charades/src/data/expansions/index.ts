import type { CharadesCard } from '../../types.js';
import { animeExpansion } from './anime-expansion.js';
import { booksExpansion } from './books-expansion.js';
import { disneyExpansion } from './disney-expansion.js';
import { moviesExpansion } from './movies-expansion.js';
import { musicExpansion } from './music-expansion.js';
import { tvExpansion } from './tv-expansion.js';
import { universalExpansion } from './universal-expansion.js';

export {
  animeExpansion,
  booksExpansion,
  disneyExpansion,
  moviesExpansion,
  musicExpansion,
  tvExpansion,
  universalExpansion,
};

/** Strip authoring `packId` tag from universal expansion cards. */
export function universalCardsForPack(packId: string): CharadesCard[] {
  return universalExpansion
    .filter((entry) => entry.packId === packId)
    .map(({ packId: _packId, ...rest }) => rest);
}
