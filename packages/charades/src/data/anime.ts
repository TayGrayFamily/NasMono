import type { CharadesPack } from '../types.js';
import { card } from './helpers.js';
import { GENS_ALL, GENS_RECENT } from './generation-tags.js';

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
    card('anm-t-001', 'Naruto', 'title', 'easy', {
      imageSearch: 'naruto anime',
      generations: GENS_ALL,
    }),
    card('anm-t-002', 'One Piece', 'title', 'easy', {
      imageSearch: 'one piece anime',
      generations: GENS_ALL,
    }),
    card('anm-t-003', 'Pokemon', 'title', 'easy', {
      imageSearch: 'pokemon anime',
      generations: GENS_ALL,
    }),
    card('anm-t-004', 'Dragon Ball Z', 'title', 'easy', {
      imageSearch: 'dragon ball z',
      generations: GENS_ALL,
    }),
    card('anm-t-005', 'My Hero Academia', 'title', 'easy', {
      imageSearch: 'my hero academia',
      generations: GENS_RECENT,
    }),
    card('anm-t-006', 'Demon Slayer', 'title', 'easy', {
      imageSearch: 'demon slayer anime',
      generations: GENS_RECENT,
    }),
    // Titles — medium
    card('anm-t-007', 'Attack on Titan', 'title', 'medium', {
      imageSearch: 'attack on titan',
      generations: GENS_RECENT,
    }),
    card('anm-t-008', 'Sailor Moon', 'title', 'medium', {
      imageSearch: 'sailor moon anime',
      generations: GENS_ALL,
    }),
    card('anm-t-009', 'Death Note', 'title', 'medium', {
      imageSearch: 'death note anime',
      generations: GENS_ALL,
    }),
    card('anm-t-010', 'Fullmetal Alchemist', 'title', 'medium', {
      imageSearch: 'fullmetal alchemist',
      generations: GENS_ALL,
    }),
    card('anm-t-011', 'Spy x Family', 'title', 'medium', {
      imageSearch: 'spy x family anime',
      generations: GENS_RECENT,
    }),
    card('anm-t-012', "JoJo's Bizarre Adventure", 'title', 'medium', {
      imageSearch: 'jojo bizarre adventure',
      generations: GENS_ALL,
    }),
    // Titles — hard
    card('anm-t-013', 'Neon Genesis Evangelion', 'title', 'hard', {
      imageSearch: 'neon genesis evangelion',
      generations: GENS_ALL,
    }),
    card('anm-t-014', 'Cowboy Bebop', 'title', 'hard', {
      imageSearch: 'cowboy bebop anime',
      generations: GENS_ALL,
    }),
    card('anm-t-015', 'Berserk', 'title', 'hard', {
      imageSearch: 'berserk anime',
      generations: GENS_ALL,
    }),
    card('anm-t-016', 'Ghost in the Shell', 'title', 'hard', {
      imageSearch: 'ghost in the shell anime',
      generations: GENS_ALL,
    }),
    card('anm-t-017', 'Serial Experiments Lain', 'title', 'hard', {
      imageSearch: 'serial experiments lain',
      generations: GENS_ALL,
    }),
    card('anm-t-018', 'Perfect Blue', 'title', 'hard', {
      imageSearch: 'perfect blue anime',
      generations: GENS_ALL,
    }),

    // Quotes — easy
    card('anm-q-001', 'Believe it!', 'quote', 'easy', {
      context: 'Naruto',
      generations: GENS_ALL,
      imageSearch: 'naruto believe it',
    }),
    card('anm-q-002', 'Plus ultra!', 'quote', 'easy', {
      context: 'My Hero Academia',
      generations: GENS_RECENT,
      imageSearch: 'all might plus ultra',
    }),
    card('anm-q-003', 'I am going to be king of the pirates', 'quote', 'easy', {
      context: 'One Piece',
      generations: GENS_ALL,
      imageSearch: 'luffy one piece',
    }),
    card('anm-q-004', 'Gotta catch em all', 'quote', 'easy', {
      context: 'Pokemon',
      generations: GENS_ALL,
      imageSearch: 'pokemon catch em all',
    }),
    card('anm-q-005', 'Over nine thousand', 'quote', 'easy', {
      context: 'Dragon Ball Z',
      generations: GENS_ALL,
      imageSearch: 'vegeta over 9000',
    }),
    card('anm-q-006', 'Omae wa mou shindeiru', 'quote', 'easy', {
      context: 'Fist of the North Star',
      generations: GENS_ALL,
      imageSearch: 'you are already dead anime',
    }),
    // Quotes — medium
    card('anm-q-007', 'I take a potato chip and eat it', 'quote', 'medium', {
      context: 'Death Note',
      generations: GENS_ALL,
      imageSearch: 'death note light',
    }),
    card('anm-q-008', 'People die when they are killed', 'quote', 'medium', {
      context: 'Fate/stay night',
      generations: GENS_ALL,
      imageSearch: 'fate stay night shirou',
    }),
    card('anm-q-009', 'Tatakae', 'quote', 'medium', {
      context: 'Attack on Titan',
      generations: GENS_RECENT,
      imageSearch: 'eren tatakae',
    }),
    card('anm-q-010', 'I am atomic', 'quote', 'medium', {
      context: 'Blue Lock',
      generations: GENS_RECENT,
      imageSearch: 'blue lock isagi',
    }),
    card('anm-q-011', 'In the name of the moon', 'quote', 'medium', {
      context: 'Sailor Moon',
      generations: GENS_ALL,
      imageSearch: 'sailor moon transformation',
    }),
    card('anm-q-012', 'Yare yare daze', 'quote', 'medium', {
      context: "JoJo's Bizarre Adventure",
      generations: GENS_ALL,
      imageSearch: 'jotaro yare yare',
    }),
    // Quotes — hard
    card('anm-q-013', 'The world', 'quote', 'hard', {
      context: "JoJo's Bizarre Adventure",
      generations: GENS_ALL,
      imageSearch: 'dio the world',
    }),
    card('anm-q-014', "I mustn't run away", 'quote', 'hard', {
      context: 'Neon Genesis Evangelion',
      generations: GENS_ALL,
      imageSearch: 'shinji evangelion',
    }),
    card('anm-q-015', 'See you space cowboy', 'quote', 'hard', {
      context: 'Cowboy Bebop',
      generations: GENS_ALL,
      imageSearch: 'cowboy bebop ending',
    }),
    card(
      'anm-q-016',
      'Humanity cannot gain anything without first giving something in return',
      'quote',
      'hard',
      {
        context: 'Fullmetal Alchemist',
        generations: GENS_ALL,
        imageSearch: 'fullmetal alchemist equivalent exchange',
      },
    ),
    card('anm-q-017', 'To know sorrow is not terrifying', 'quote', 'hard', {
      context: 'Naruto',
      generations: GENS_ALL,
      imageSearch: 'itachi naruto',
    }),
    card('anm-q-018', 'I am justice', 'quote', 'hard', {
      context: 'Death Note',
      generations: GENS_ALL,
      imageSearch: 'light yagami death note',
    }),

    // Characters — easy
    card('anm-c-001', 'Goku', 'character', 'easy', { context: 'Dragon Ball Z' }),
    card('anm-c-002', 'Chihiro', 'character', 'easy', { context: 'Spirited Away' }),
    card('anm-c-003', 'Sailor Moon', 'character', 'easy', { context: 'Sailor Moon' }),
    card('anm-c-004', 'Naruto Uzumaki', 'character', 'easy', { context: 'Naruto' }),
    card('anm-c-005', 'Luffy', 'character', 'easy', { context: 'One Piece' }),
    card('anm-c-006', 'Ichigo Kurosaki', 'character', 'easy', { context: 'Bleach' }),
    card('anm-c-007', 'Ash Ketchum', 'character', 'easy', { context: 'Pokemon' }),
    card('anm-c-008', 'Totoro', 'character', 'easy', { context: 'My Neighbor Totoro' }),
    card('anm-c-009', 'Doraemon', 'character', 'easy', { context: 'Doraemon' }),
    card('anm-c-010', 'Inuyasha', 'character', 'easy', { context: 'Inuyasha' }),
    card('anm-c-011', 'Vegeta', 'character', 'easy', { context: 'Dragon Ball Z' }),
    card('anm-c-012', 'Mikasa Ackerman', 'character', 'easy', { context: 'Attack on Titan' }),
    card('anm-c-013', 'Eren Yeager', 'character', 'easy', { context: 'Attack on Titan' }),
    card('anm-c-014', 'Tanjiro Kamado', 'character', 'easy', { context: 'Demon Slayer' }),
    card('anm-c-015', 'Nezuko Kamado', 'character', 'easy', { context: 'Demon Slayer' }),
    // Characters — medium
    card('anm-c-016', 'Sasuke Uchiha', 'character', 'medium', { context: 'Naruto' }),
    card('anm-c-017', 'Sakura Haruno', 'character', 'medium', { context: 'Naruto' }),
    card('anm-c-018', 'Zoro', 'character', 'medium', { context: 'One Piece' }),
    card('anm-c-019', 'Nami', 'character', 'medium', { context: 'One Piece' }),
    card('anm-c-020', 'Light Yagami', 'character', 'medium', { context: 'Death Note' }),
    card('anm-c-021', 'L', 'character', 'medium', { context: 'Death Note' }),
    card('anm-c-022', 'Edward Elric', 'character', 'medium', { context: 'Fullmetal Alchemist' }),
    card('anm-c-023', 'Alphonse Elric', 'character', 'medium', { context: 'Fullmetal Alchemist' }),
    card('anm-c-024', 'Spike Spiegel', 'character', 'medium', { context: 'Cowboy Bebop' }),
    card('anm-c-025', 'Faye Valentine', 'character', 'medium', { context: 'Cowboy Bebop' }),
    card('anm-c-026', 'Gon Freecss', 'character', 'medium', { context: 'Hunter x Hunter' }),
    card('anm-c-027', 'Killua Zoldyck', 'character', 'medium', { context: 'Hunter x Hunter' }),
    card('anm-c-028', 'Levi Ackerman', 'character', 'medium', { context: 'Attack on Titan' }),
    card('anm-c-029', 'All Might', 'character', 'medium', { context: 'My Hero Academia' }),
    card('anm-c-030', 'Deku', 'character', 'medium', { context: 'My Hero Academia' }),
    card('anm-c-031', 'Bakugo', 'character', 'medium', { context: 'My Hero Academia' }),
    card('anm-c-032', 'Saitama', 'character', 'medium', { context: 'One Punch Man' }),
    card('anm-c-033', 'Genos', 'character', 'medium', { context: 'One Punch Man' }),
    card('anm-c-034', 'Rem', 'character', 'medium', { context: 'Re:Zero' }),
    card('anm-c-035', 'Emilia', 'character', 'medium', { context: 'Re:Zero' }),
    card('anm-c-036', 'Megumin', 'character', 'medium', { context: 'Konosuba' }),
    card('anm-c-037', 'Aqua', 'character', 'medium', { context: 'Konosuba' }),
    card('anm-c-038', 'Kazuma', 'character', 'medium', { context: 'Konosuba' }),
    card('anm-c-039', 'Yuji Itadori', 'character', 'medium', { context: 'Jujutsu Kaisen' }),
    // Characters — hard
    card('anm-c-040', 'Mob', 'character', 'hard', { context: 'Mob Psycho 100' }),
    card('anm-c-041', 'Reigen Arataka', 'character', 'hard', { context: 'Mob Psycho 100' }),
    card('anm-c-042', 'Thorfinn', 'character', 'hard', { context: 'Vinland Saga' }),
    card('anm-c-043', 'Askeladd', 'character', 'hard', { context: 'Vinland Saga' }),
    card('anm-c-044', 'Guts', 'character', 'hard', { context: 'Berserk' }),
    card('anm-c-045', 'Griffith', 'character', 'hard', { context: 'Berserk' }),
    card('anm-c-046', 'Vash the Stampede', 'character', 'hard', { context: 'Trigun' }),
    card('anm-c-047', 'Alucard', 'character', 'hard', { context: 'Hellsing' }),
    card('anm-c-048', 'Johan Liebert', 'character', 'hard', { context: 'Monster' }),
    card('anm-c-049', 'Lelouch vi Britannia', 'character', 'hard', { context: 'Code Geass' }),
    card('anm-c-050', 'C.C.', 'character', 'hard', { context: 'Code Geass' }),
    card('anm-c-051', 'Kamina', 'character', 'hard', { context: 'Gurren Lagann' }),
    card('anm-c-052', 'Simon', 'character', 'hard', { context: 'Gurren Lagann' }),
    card('anm-c-053', 'Homura Akemi', 'character', 'hard', {
      context: 'Puella Magi Madoka Magica',
      imageSearch: 'homura akemi madoka magica',
    }),
    card('anm-c-054', 'Madoka Kaname', 'character', 'hard', {
      context: 'Puella Magi Madoka Magica',
      imageSearch: 'madoka kaname madoka magica',
    }),
    card('anm-c-055', 'Shinji Ikari', 'character', 'hard', { context: 'Neon Genesis Evangelion' }),
    card('anm-c-056', 'Rei Ayanami', 'character', 'hard', { context: 'Neon Genesis Evangelion' }),
    card('anm-c-057', 'Asuka Langley', 'character', 'hard', { context: 'Neon Genesis Evangelion' }),
    card('anm-c-058', 'Jotaro Kujo', 'character', 'hard', { context: "JoJo's Bizarre Adventure" }),
    card('anm-c-059', 'Dio Brando', 'character', 'hard', { context: "JoJo's Bizarre Adventure" }),
  ],
};
