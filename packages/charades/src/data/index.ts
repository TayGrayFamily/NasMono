import { validatePack } from '../schema.js';
import { aroundTheHousePack } from './around-the-house.js';
import { animalsPack } from './animals.js';
import { movieQuotesPack } from './movie-quotes.js';
import { videoGameCharactersPack } from './video-game-characters.js';
import { nintendoGamesPack } from './nintendo-games.js';
import { animeCharactersPack } from './anime-characters.js';
import type { CharadesPack } from '../types.js';

const rawPacks: CharadesPack[] = [
  aroundTheHousePack,
  animalsPack,
  movieQuotesPack,
  videoGameCharactersPack,
  nintendoGamesPack,
  animeCharactersPack,
];

export const allPacks: CharadesPack[] = rawPacks.map((pack) => validatePack(pack));

export function getPackById(id: string): CharadesPack | undefined {
  return allPacks.find((pack) => pack.id === id);
}
