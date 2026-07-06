import type { CharadesPack } from '../types.js';
import { card } from './helpers.js';
import { GENS_ALL, GENS_RECENT } from './generation-tags.js';
import { animeExpansion } from './expansions/anime-expansion.js';

/** Anime & manga — toggle titles, quotes, and characters separately. */
export const animePack: CharadesPack = {
  id: 'anime',
  name: 'Anime',
  description:
    'Titles, quotes, and characters from anime and manga. Turn off any type you do not want.',
  ageMin: 12,
  ageMax: null,
  cards: [
    // Titles — easy
    card('anm-t-001', 'Naruto', 'title', 4, {
      imageSearch: 'naruto anime',
      generations: GENS_ALL,
    }),
    card('anm-t-002', 'One Piece', 'title', 1, {
      imageSearch: 'one piece anime',
      generations: GENS_ALL,
    }),
    card('anm-t-003', 'Pokemon', 'title', 2, {
      imageSearch: 'pokemon anime',
      generations: GENS_ALL,
    }),
    card('anm-t-004', 'Dragon Ball Z', 'title', 3, {
      imageSearch: 'dragon ball z',
      generations: GENS_ALL,
    }),
    card('anm-t-005', 'My Hero Academia', 'title', 4, {
      imageSearch: 'my hero academia',
      generations: GENS_RECENT,
    }),
    card('anm-t-006', 'Demon Slayer', 'title', 1, {
      imageSearch: 'demon slayer anime',
      generations: GENS_RECENT,
    }),
    // Titles — medium
    card('anm-t-007', 'Attack on Titan', 'title', 5, {
      imageSearch: 'attack on titan',
      generations: GENS_RECENT,
    }),
    card('anm-t-008', 'Sailor Moon', 'title', 6, {
      imageSearch: 'sailor moon anime',
      generations: GENS_ALL,
    }),
    card('anm-t-009', 'Death Note', 'title', 7, {
      imageSearch: 'death note anime',
      generations: GENS_ALL,
    }),
    card('anm-t-010', 'Fullmetal Alchemist', 'title', 5, {
      imageSearch: 'fullmetal alchemist',
      generations: GENS_ALL,
    }),
    card('anm-t-011', 'Spy x Family', 'title', 6, {
      imageSearch: 'spy x family anime',
      generations: GENS_RECENT,
    }),
    card('anm-t-012', "JoJo's Bizarre Adventure", 'title', 7, {
      imageSearch: 'jojo bizarre adventure',
      generations: GENS_ALL,
    }),
    // Titles — hard
    card('anm-t-013', 'Neon Genesis Evangelion', 'title', 7, {
      imageSearch: 'neon genesis evangelion',
      generations: GENS_ALL,
    }),
    card('anm-t-014', 'Cowboy Bebop', 'title', 8, {
      imageSearch: 'cowboy bebop anime',
      generations: GENS_ALL,
    }),
    card('anm-t-015', 'Berserk', 'title', 9, {
      imageSearch: 'berserk anime',
      generations: GENS_ALL,
    }),
    card('anm-t-016', 'Ghost in the Shell', 'title', 10, {
      imageSearch: 'ghost in the shell anime',
      generations: GENS_ALL,
    }),
    card('anm-t-017', 'Serial Experiments Lain', 'title', 7, {
      imageSearch: 'serial experiments lain',
      generations: GENS_ALL,
    }),
    card('anm-t-018', 'Perfect Blue', 'title', 8, {
      imageSearch: 'perfect blue anime',
      generations: GENS_ALL,
    }),

    // Quotes — easy
    card('anm-q-001', 'Believe it!', 'quote', 1, {
      context: 'Naruto',
      generations: GENS_ALL,
      imageSearch: 'naruto believe it',
    }),
    card('anm-q-002', 'Plus ultra!', 'quote', 2, {
      context: 'My Hero Academia',
      generations: GENS_RECENT,
      imageSearch: 'all might plus ultra',
    }),
    card('anm-q-003', 'I am going to be king of the pirates', 'quote', 3, {
      context: 'One Piece',
      generations: GENS_ALL,
      imageSearch: 'luffy one piece',
    }),
    card('anm-q-004', 'Gotta catch em all', 'quote', 4, {
      context: 'Pokemon',
      generations: GENS_ALL,
      imageSearch: 'pokemon catch em all',
    }),
    card('anm-q-005', 'Over nine thousand', 'quote', 1, {
      context: 'Dragon Ball Z',
      generations: GENS_ALL,
      imageSearch: 'vegeta over 9000',
    }),
    card('anm-q-006', 'Omae wa mou shindeiru', 'quote', 2, {
      context: 'Fist of the North Star',
      generations: GENS_ALL,
      imageSearch: 'you are already dead anime',
    }),
    // Quotes — medium
    card('anm-q-007', 'I take a potato chip and eat it', 'quote', 6, {
      context: 'Death Note',
      generations: GENS_ALL,
      imageSearch: 'death note light',
    }),
    card('anm-q-008', 'People die when they are killed', 'quote', 7, {
      context: 'Fate/stay night',
      generations: GENS_ALL,
      imageSearch: 'fate stay night shirou',
    }),
    card('anm-q-009', 'Tatakae', 'quote', 4, {
      context: 'Attack on Titan',
      generations: GENS_RECENT,
      imageSearch: 'eren tatakae',
    }),
    card('anm-q-010', 'I am atomic', 'quote', 6, {
      context: 'Blue Lock',
      generations: GENS_RECENT,
      imageSearch: 'blue lock isagi',
    }),
    card('anm-q-011', 'In the name of the moon', 'quote', 7, {
      context: 'Sailor Moon',
      generations: GENS_ALL,
      imageSearch: 'sailor moon transformation',
    }),
    card('anm-q-012', 'Yare yare daze', 'quote', 4, {
      context: "JoJo's Bizarre Adventure",
      generations: GENS_ALL,
      imageSearch: 'jotaro yare yare',
    }),
    // Quotes — hard
    card('anm-q-013', 'The world', 'quote', 8, {
      context: "JoJo's Bizarre Adventure",
      generations: GENS_ALL,
      imageSearch: 'dio the world',
    }),
    card('anm-q-014', "I mustn't run away", 'quote', 9, {
      context: 'Neon Genesis Evangelion',
      generations: GENS_ALL,
      imageSearch: 'shinji evangelion',
    }),
    card('anm-q-015', 'See you space cowboy', 'quote', 10, {
      context: 'Cowboy Bebop',
      generations: GENS_ALL,
      imageSearch: 'cowboy bebop ending',
    }),
    card(
      'anm-q-016',
      'Humanity cannot gain anything without first giving something in return',
      'quote',
      7,
      {
        context: 'Fullmetal Alchemist',
        generations: GENS_ALL,
        imageSearch: 'fullmetal alchemist equivalent exchange',
      },
    ),
    card('anm-q-017', 'To know sorrow is not terrifying', 'quote', 8, {
      context: 'Naruto',
      generations: GENS_ALL,
      imageSearch: 'itachi naruto',
    }),
    card('anm-q-018', 'I am justice', 'quote', 9, {
      context: 'Death Note',
      generations: GENS_ALL,
      imageSearch: 'light yagami death note',
    }),

    // Characters — easy
    card('anm-c-001', 'Goku', 'character', 3, { context: 'Dragon Ball Z' }),
    card('anm-c-002', 'Chihiro', 'character', 4, { context: 'Spirited Away' }),
    card('anm-c-003', 'Sailor Moon', 'character', 1, { context: 'Sailor Moon' }),
    card('anm-c-004', 'Naruto Uzumaki', 'character', 2, { context: 'Naruto' }),
    card('anm-c-005', 'Luffy', 'character', 3, { context: 'One Piece' }),
    card('anm-c-006', 'Ichigo Kurosaki', 'character', 4, { context: 'Bleach' }),
    card('anm-c-007', 'Ash Ketchum', 'character', 1, { context: 'Pokemon' }),
    card('anm-c-008', 'Totoro', 'character', 2, { context: 'My Neighbor Totoro' }),
    card('anm-c-009', 'Doraemon', 'character', 3, { context: 'Doraemon' }),
    card('anm-c-010', 'Inuyasha', 'character', 1, { context: 'Inuyasha' }),
    card('anm-c-011', 'Vegeta', 'character', 2, { context: 'Dragon Ball Z' }),
    card('anm-c-012', 'Mikasa Ackerman', 'character', 3, { context: 'Attack on Titan' }),
    card('anm-c-013', 'Eren Yeager', 'character', 4, { context: 'Attack on Titan' }),
    card('anm-c-014', 'Tanjiro Kamado', 'character', 1, { context: 'Demon Slayer' }),
    card('anm-c-015', 'Nezuko Kamado', 'character', 2, { context: 'Demon Slayer' }),
    // Characters — medium
    card('anm-c-016', 'Sasuke Uchiha', 'character', 6, { context: 'Naruto' }),
    card('anm-c-017', 'Sakura Haruno', 'character', 7, { context: 'Naruto' }),
    card('anm-c-018', 'Zoro', 'character', 4, { context: 'One Piece' }),
    card('anm-c-019', 'Nami', 'character', 5, { context: 'One Piece' }),
    card('anm-c-020', 'Light Yagami', 'character', 7, { context: 'Death Note' }),
    card('anm-c-021', 'L', 'character', 4, { context: 'Death Note' }),
    card('anm-c-022', 'Edward Elric', 'character', 5, { context: 'Fullmetal Alchemist' }),
    card('anm-c-023', 'Alphonse Elric', 'character', 6, { context: 'Fullmetal Alchemist' }),
    card('anm-c-024', 'Spike Spiegel', 'character', 7, { context: 'Cowboy Bebop' }),
    card('anm-c-025', 'Faye Valentine', 'character', 4, { context: 'Cowboy Bebop' }),
    card('anm-c-026', 'Gon Freecss', 'character', 5, { context: 'Hunter x Hunter' }),
    card('anm-c-027', 'Killua Zoldyck', 'character', 6, { context: 'Hunter x Hunter' }),
    card('anm-c-028', 'Levi Ackerman', 'character', 7, { context: 'Attack on Titan' }),
    card('anm-c-029', 'All Might', 'character', 4, { context: 'My Hero Academia' }),
    card('anm-c-030', 'Deku', 'character', 6, { context: 'My Hero Academia' }),
    card('anm-c-031', 'Bakugo', 'character', 7, { context: 'My Hero Academia' }),
    card('anm-c-032', 'Saitama', 'character', 4, { context: 'One Punch Man' }),
    card('anm-c-033', 'Genos', 'character', 5, { context: 'One Punch Man' }),
    card('anm-c-034', 'Rem', 'character', 6, { context: 'Re:Zero' }),
    card('anm-c-035', 'Emilia', 'character', 7, { context: 'Re:Zero' }),
    card('anm-c-036', 'Megumin', 'character', 4, { context: 'Konosuba' }),
    card('anm-c-037', 'Aqua', 'character', 5, { context: 'Konosuba' }),
    card('anm-c-038', 'Kazuma', 'character', 6, { context: 'Konosuba' }),
    card('anm-c-039', 'Yuji Itadori', 'character', 7, { context: 'Jujutsu Kaisen' }),
    // Characters — hard
    card('anm-c-040', 'Mob', 'character', 8, { context: 'Mob Psycho 100' }),
    card('anm-c-041', 'Reigen Arataka', 'character', 9, { context: 'Mob Psycho 100' }),
    card('anm-c-042', 'Thorfinn', 'character', 10, { context: 'Vinland Saga' }),
    card('anm-c-043', 'Askeladd', 'character', 7, { context: 'Vinland Saga' }),
    card('anm-c-044', 'Guts', 'character', 8, { context: 'Berserk' }),
    card('anm-c-045', 'Griffith', 'character', 9, { context: 'Berserk' }),
    card('anm-c-046', 'Vash the Stampede', 'character', 10, { context: 'Trigun' }),
    card('anm-c-047', 'Alucard', 'character', 7, { context: 'Hellsing' }),
    card('anm-c-048', 'Johan Liebert', 'character', 8, { context: 'Monster' }),
    card('anm-c-049', 'Lelouch vi Britannia', 'character', 9, { context: 'Code Geass' }),
    card('anm-c-050', 'C.C.', 'character', 7, { context: 'Code Geass' }),
    card('anm-c-051', 'Kamina', 'character', 8, { context: 'Gurren Lagann' }),
    card('anm-c-052', 'Simon', 'character', 9, { context: 'Gurren Lagann' }),
    card('anm-c-053', 'Homura Akemi', 'character', 10, {
      context: 'Puella Magi Madoka Magica',
      imageSearch: 'homura akemi madoka magica',
    }),
    card('anm-c-054', 'Madoka Kaname', 'character', 7, {
      context: 'Puella Magi Madoka Magica',
      imageSearch: 'madoka kaname madoka magica',
    }),
    card('anm-c-055', 'Shinji Ikari', 'character', 8, { context: 'Neon Genesis Evangelion' }),
    card('anm-c-056', 'Rei Ayanami', 'character', 9, { context: 'Neon Genesis Evangelion' }),
    card('anm-c-057', 'Asuka Langley', 'character', 10, { context: 'Neon Genesis Evangelion' }),
    card('anm-c-058', 'Jotaro Kujo', 'character', 7, { context: "JoJo's Bizarre Adventure" }),
    card('anm-c-059', 'Dio Brando', 'character', 8, { context: "JoJo's Bizarre Adventure" }),
    ...animeExpansion,
  ],
};
