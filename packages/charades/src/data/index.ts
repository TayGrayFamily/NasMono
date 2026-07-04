import { validatePack } from '../schema.js';
import { aroundTheHousePack } from './around-the-house.js';
import { actionsPack } from './actions.js';
import { animalsPack } from './animals.js';
import { animeCharactersPack } from './anime-characters.js';
import { booksPack } from './books-and-stories.js';
import { disneyPack } from './disney.js';
import { emotionsPack } from './emotions.js';
import { foodAndDrinkPack } from './food-and-drink.js';
import { jobsPack } from './jobs.js';
import { moviesPack } from './movies.js';
import { musicPack } from './music.js';
import { nintendoGamesPack } from './nintendo-games.js';
import { placesPack } from './places.js';
import { sportsPack } from './sports.js';
import { tvShowsPack } from './tv-shows.js';
import { videoGameCharactersPack } from './video-game-characters.js';
import type { CharadesPack } from '../types.js';

/** Packs ordered for the setup screen: family-friendly first, niche last. */
const rawPacks: CharadesPack[] = [
  actionsPack,
  animalsPack,
  aroundTheHousePack,
  disneyPack,
  emotionsPack,
  foodAndDrinkPack,
  jobsPack,
  moviesPack,
  musicPack,
  booksPack,
  placesPack,
  sportsPack,
  tvShowsPack,
  nintendoGamesPack,
  videoGameCharactersPack,
  animeCharactersPack,
];

export const allPacks: CharadesPack[] = rawPacks.map((pack) => validatePack(pack));

export function getPackById(id: string): CharadesPack | undefined {
  return allPacks.find((pack) => pack.id === id);
}
