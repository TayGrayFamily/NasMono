import type { CharadesPack } from '../types.js';
import { card } from './helpers.js';
import { disneyExpansion } from './expansions/disney-expansion.js';

export const disneyPack: CharadesPack = {
  id: 'disney',
  name: 'Disney & Family',
  description: 'Disney and Pixar titles and characters — perfect for mixed-age groups.',
  ageMin: 4,
  ageMax: null,
  cards: [
    card('dis-t-001', 'Frozen', 'title', 2, {
      emoji: '❄️',
      imageSearch: 'frozen elsa disney',
    }),
    card('dis-t-002', 'The Lion King', 'title', 3, {
      emoji: '🦁',
      imageSearch: 'lion king simba',
    }),
    card('dis-t-003', 'Moana', 'title', 4, {
      emoji: '🌊',
      imageSearch: 'moana disney',
    }),
    card('dis-t-004', 'Toy Story', 'title', 1, {
      emoji: '🤠',
      imageSearch: 'toy story woody buzz',
    }),
    card('dis-t-005', 'Finding Nemo', 'title', 2, {
      emoji: '🐠',
      imageSearch: 'finding nemo',
    }),
    card('dis-t-006', 'Cinderella', 'title', 3, {
      emoji: '👠',
      imageSearch: 'cinderella disney',
    }),
    card('dis-t-007', 'Encanto', 'title', 7, { imageSearch: 'encanto disney' }),
    card('dis-t-008', 'Zootopia', 'title', 4, { imageSearch: 'zootopia judy hopps' }),
    card('dis-t-009', 'Big Hero 6', 'title', 5, { imageSearch: 'big hero 6 baymax' }),
    card('dis-t-010', 'Ratatouille', 'title', 7, { imageSearch: 'ratatouille remy' }),
    card('dis-t-011', 'The Incredibles', 'title', 4, { imageSearch: 'the incredibles' }),
    card('dis-t-012', 'Inside Out', 'title', 5, { imageSearch: 'inside out joy sadness' }),
    card('dis-t-013', 'Fantasia', 'title', 9, { imageSearch: 'disney fantasia' }),
    card('dis-t-014', 'The Black Cauldron', 'title', 10, {
      imageSearch: 'black cauldron disney',
    }),
    card('dis-t-015', 'Atlantis: The Lost Empire', 'title', 7, {
      imageSearch: 'atlantis lost empire',
    }),
    card('dis-t-016', 'Treasure Planet', 'title', 8, { imageSearch: 'treasure planet' }),
    card('dis-t-017', 'The Hunchback of Notre Dame', 'title', 9, {
      imageSearch: 'hunchback of notre dame disney',
    }),
    card('dis-t-018', "The Emperor's New Groove", 'title', 10, {
      imageSearch: 'emperors new groove kuzco',
    }),

    card('dis-c-001', 'Mickey Mouse', 'character', 1, { imageSearch: 'mickey mouse' }),
    card('dis-c-002', 'Elsa', 'character', 2, {
      context: 'Frozen',
      emoji: '❄️',
      imageSearch: 'elsa frozen',
    }),
    card('dis-c-003', 'Simba', 'character', 3, {
      context: 'The Lion King',
      emoji: '🦁',
      imageSearch: 'simba lion king',
    }),
    card('dis-c-004', 'Woody', 'character', 4, {
      context: 'Toy Story',
      imageSearch: 'woody toy story',
    }),
    card('dis-c-005', 'Buzz Lightyear', 'character', 1, {
      context: 'Toy Story',
      imageSearch: 'buzz lightyear',
    }),
    card('dis-c-006', 'Maui', 'character', 2, {
      context: 'Moana',
      imageSearch: 'maui moana',
    }),
    card('dis-c-007', 'Mirabel', 'character', 6, {
      context: 'Encanto',
      imageSearch: 'mirabel encanto',
    }),
    card('dis-c-008', 'Stitch', 'character', 7, { imageSearch: 'stitch lilo' }),
    card('dis-c-009', 'Baymax', 'character', 4, { imageSearch: 'baymax big hero 6' }),
    card('dis-c-010', 'Remy', 'character', 6, {
      context: 'Ratatouille',
      imageSearch: 'remy ratatouille',
    }),
    card('dis-c-011', 'Mr. Incredible', 'character', 7, { imageSearch: 'mr incredible' }),
    card('dis-c-012', 'Joy', 'character', 4, {
      context: 'Inside Out',
      imageSearch: 'joy inside out',
    }),
    card('dis-c-013', 'Kuzco', 'character', 8, { imageSearch: 'kuzco emperors new groove' }),
    card('dis-c-014', 'Quasimodo', 'character', 9, {
      imageSearch: 'quasimodo hunchback',
    }),
    card('dis-c-015', 'Milo Thatch', 'character', 10, {
      context: 'Atlantis',
      imageSearch: 'atlantis milo',
    }),
    card('dis-c-016', 'Jim Hawkins', 'character', 7, {
      context: 'Treasure Planet',
      imageSearch: 'treasure planet jim',
    }),
    card('dis-c-017', 'Chernabog', 'character', 8, { imageSearch: 'chernabog fantasia' }),
    card('dis-c-018', 'The Horned King', 'character', 9, {
      imageSearch: 'horned king black cauldron',
    }),

    card('dis-x-001', 'Let It Go', 'quote', 2, {
      context: 'Frozen',
      imageSearch: 'frozen let it go elsa',
    }),
    card('dis-x-002', 'Hakuna matata', 'quote', 3, {
      context: 'The Lion King',
      imageSearch: 'lion king hakuna matata',
    }),
    card('dis-x-003', 'To infinity and beyond', 'quote', 4, {
      context: 'Toy Story',
      imageSearch: 'buzz lightyear infinity',
    }),
    card('dis-x-004', 'Just keep swimming', 'quote', 1, {
      context: 'Finding Nemo',
      imageSearch: 'dory just keep swimming',
    }),
    card('dis-x-005', 'Bibbidi bobbidi boo', 'quote', 2, {
      context: 'Cinderella',
      imageSearch: 'cinderella fairy godmother',
    }),
    card('dis-x-006', "We don't talk about Bruno", 'quote', 6, {
      context: 'Encanto',
      imageSearch: 'encanto bruno',
    }),
    card('dis-x-007', 'Ohana means family', 'quote', 7, {
      context: 'Lilo & Stitch',
      imageSearch: 'lilo and stitch ohana',
    }),
    card('dis-x-008', 'Adventure is out there', 'quote', 4, {
      context: 'Up',
      imageSearch: 'up movie adventure is out there',
    }),
    card('dis-x-009', 'Anyone can cook', 'quote', 5, {
      context: 'Ratatouille',
      imageSearch: 'ratatouille anyone can cook',
    }),
    card('dis-x-010', 'I am speed', 'quote', 7, {
      context: 'Cars',
      imageSearch: 'lightning mcqueen i am speed',
    }),
    card('dis-x-011', 'Pull the lever, Kronk', 'quote', 7, {
      context: "The Emperor's New Groove",
      imageSearch: 'kronk emperors new groove',
    }),
    card('dis-x-012', 'The bare necessities', 'quote', 8, {
      context: 'The Jungle Book',
      imageSearch: 'jungle book baloo',
    }),
    card('dis-x-013', 'Supercalifragilisticexpialidocious', 'quote', 9, {
      context: 'Mary Poppins',
      imageSearch: 'mary poppins',
    }),
    card('dis-x-014', 'Zip-a-dee-doo-dah', 'quote', 10, {
      context: 'Song of the South',
      imageSearch: 'zip a dee doo dah disney',
    }),
    card('dis-x-015', 'A whole new world', 'quote', 7, {
      context: 'Aladdin',
      imageSearch: 'aladdin whole new world',
    }),
    card('dis-x-016', 'Be our guest', 'quote', 8, {
      context: 'Beauty and the Beast',
      imageSearch: 'beauty and the beast be our guest',
    }),
    card('dis-x-017', 'Circle of life', 'quote', 9, {
      context: 'The Lion King',
      imageSearch: 'lion king circle of life',
    }),
    card('dis-x-018', 'Almost there', 'quote', 10, {
      context: 'The Princess and the Frog',
      imageSearch: 'princess and the frog',
    }),
    ...disneyExpansion,
  ],
};
