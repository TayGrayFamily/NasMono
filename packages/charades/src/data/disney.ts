import type { CharadesPack } from '../types.js';
import { card } from './helpers.js';

export const disneyPack: CharadesPack = {
  id: 'disney',
  name: 'Disney & Family',
  description: 'Disney and Pixar titles and characters — perfect for mixed-age groups.',
  ageMin: 4,
  ageMax: null,
  cards: [
    card('dis-t-001', 'Frozen', 'title', 'easy', {
      emoji: '❄️',
      imageSearch: 'frozen elsa disney',
    }),
    card('dis-t-002', 'The Lion King', 'title', 'easy', {
      emoji: '🦁',
      imageSearch: 'lion king simba',
    }),
    card('dis-t-003', 'Moana', 'title', 'easy', {
      emoji: '🌊',
      imageSearch: 'moana disney',
    }),
    card('dis-t-004', 'Toy Story', 'title', 'easy', {
      emoji: '🤠',
      imageSearch: 'toy story woody buzz',
    }),
    card('dis-t-005', 'Finding Nemo', 'title', 'easy', {
      emoji: '🐠',
      imageSearch: 'finding nemo',
    }),
    card('dis-t-006', 'Cinderella', 'title', 'easy', {
      emoji: '👠',
      imageSearch: 'cinderella disney',
    }),
    card('dis-t-007', 'Encanto', 'title', 'medium', { imageSearch: 'encanto disney' }),
    card('dis-t-008', 'Zootopia', 'title', 'medium', { imageSearch: 'zootopia judy hopps' }),
    card('dis-t-009', 'Big Hero 6', 'title', 'medium', { imageSearch: 'big hero 6 baymax' }),
    card('dis-t-010', 'Ratatouille', 'title', 'medium', { imageSearch: 'ratatouille remy' }),
    card('dis-t-011', 'The Incredibles', 'title', 'medium', { imageSearch: 'the incredibles' }),
    card('dis-t-012', 'Inside Out', 'title', 'medium', { imageSearch: 'inside out joy sadness' }),
    card('dis-t-013', 'Fantasia', 'title', 'hard', { imageSearch: 'disney fantasia' }),
    card('dis-t-014', 'The Black Cauldron', 'title', 'hard', {
      imageSearch: 'black cauldron disney',
    }),
    card('dis-t-015', 'Atlantis: The Lost Empire', 'title', 'hard', {
      imageSearch: 'atlantis lost empire',
    }),
    card('dis-t-016', 'Treasure Planet', 'title', 'hard', { imageSearch: 'treasure planet' }),
    card('dis-t-017', 'The Hunchback of Notre Dame', 'title', 'hard', {
      imageSearch: 'hunchback of notre dame disney',
    }),
    card('dis-t-018', "The Emperor's New Groove", 'title', 'hard', {
      imageSearch: 'emperors new groove kuzco',
    }),

    card('dis-c-001', 'Mickey Mouse', 'character', 'easy', { imageSearch: 'mickey mouse' }),
    card('dis-c-002', 'Elsa', 'character', 'easy', {
      context: 'Frozen',
      emoji: '❄️',
      imageSearch: 'elsa frozen',
    }),
    card('dis-c-003', 'Simba', 'character', 'easy', {
      context: 'The Lion King',
      emoji: '🦁',
      imageSearch: 'simba lion king',
    }),
    card('dis-c-004', 'Woody', 'character', 'easy', {
      context: 'Toy Story',
      imageSearch: 'woody toy story',
    }),
    card('dis-c-005', 'Buzz Lightyear', 'character', 'easy', {
      context: 'Toy Story',
      imageSearch: 'buzz lightyear',
    }),
    card('dis-c-006', 'Maui', 'character', 'easy', {
      context: 'Moana',
      imageSearch: 'maui moana',
    }),
    card('dis-c-007', 'Mirabel', 'character', 'medium', {
      context: 'Encanto',
      imageSearch: 'mirabel encanto',
    }),
    card('dis-c-008', 'Stitch', 'character', 'medium', { imageSearch: 'stitch lilo' }),
    card('dis-c-009', 'Baymax', 'character', 'medium', { imageSearch: 'baymax big hero 6' }),
    card('dis-c-010', 'Remy', 'character', 'medium', {
      context: 'Ratatouille',
      imageSearch: 'remy ratatouille',
    }),
    card('dis-c-011', 'Mr. Incredible', 'character', 'medium', { imageSearch: 'mr incredible' }),
    card('dis-c-012', 'Joy', 'character', 'medium', {
      context: 'Inside Out',
      imageSearch: 'joy inside out',
    }),
    card('dis-c-013', 'Kuzco', 'character', 'hard', { imageSearch: 'kuzco emperors new groove' }),
    card('dis-c-014', 'Quasimodo', 'character', 'hard', {
      imageSearch: 'quasimodo hunchback',
    }),
    card('dis-c-015', 'Milo Thatch', 'character', 'hard', {
      context: 'Atlantis',
      imageSearch: 'atlantis milo',
    }),
    card('dis-c-016', 'Jim Hawkins', 'character', 'hard', {
      context: 'Treasure Planet',
      imageSearch: 'treasure planet jim',
    }),
    card('dis-c-017', 'Chernabog', 'character', 'hard', { imageSearch: 'chernabog fantasia' }),
    card('dis-c-018', 'The Horned King', 'character', 'hard', {
      imageSearch: 'horned king black cauldron',
    }),

    card('dis-x-001', 'Let It Go', 'quote', 'easy', {
      context: 'Frozen',
      imageSearch: 'frozen let it go elsa',
    }),
    card('dis-x-002', 'Hakuna matata', 'quote', 'easy', {
      context: 'The Lion King',
      imageSearch: 'lion king hakuna matata',
    }),
    card('dis-x-003', 'To infinity and beyond', 'quote', 'easy', {
      context: 'Toy Story',
      imageSearch: 'buzz lightyear infinity',
    }),
    card('dis-x-004', 'Just keep swimming', 'quote', 'easy', {
      context: 'Finding Nemo',
      imageSearch: 'dory just keep swimming',
    }),
    card('dis-x-005', 'Bibbidi bobbidi boo', 'quote', 'easy', {
      context: 'Cinderella',
      imageSearch: 'cinderella fairy godmother',
    }),
    card('dis-x-006', "We don't talk about Bruno", 'quote', 'medium', {
      context: 'Encanto',
      imageSearch: 'encanto bruno',
    }),
    card('dis-x-007', 'Ohana means family', 'quote', 'medium', {
      context: 'Lilo & Stitch',
      imageSearch: 'lilo and stitch ohana',
    }),
    card('dis-x-008', 'Adventure is out there', 'quote', 'medium', {
      context: 'Up',
      imageSearch: 'up movie adventure is out there',
    }),
    card('dis-x-009', 'Anyone can cook', 'quote', 'medium', {
      context: 'Ratatouille',
      imageSearch: 'ratatouille anyone can cook',
    }),
    card('dis-x-010', 'I am speed', 'quote', 'medium', {
      context: 'Cars',
      imageSearch: 'lightning mcqueen i am speed',
    }),
    card('dis-x-011', 'Pull the lever, Kronk', 'quote', 'hard', {
      context: "The Emperor's New Groove",
      imageSearch: 'kronk emperors new groove',
    }),
    card('dis-x-012', 'The bare necessities', 'quote', 'hard', {
      context: 'The Jungle Book',
      imageSearch: 'jungle book baloo',
    }),
    card('dis-x-013', 'Supercalifragilisticexpialidocious', 'quote', 'hard', {
      context: 'Mary Poppins',
      imageSearch: 'mary poppins',
    }),
    card('dis-x-014', 'Zip-a-dee-doo-dah', 'quote', 'hard', {
      context: 'Song of the South',
      imageSearch: 'zip a dee doo dah disney',
    }),
    card('dis-x-015', 'A whole new world', 'quote', 'hard', {
      context: 'Aladdin',
      imageSearch: 'aladdin whole new world',
    }),
    card('dis-x-016', 'Be our guest', 'quote', 'hard', {
      context: 'Beauty and the Beast',
      imageSearch: 'beauty and the beast be our guest',
    }),
    card('dis-x-017', 'Circle of life', 'quote', 'hard', {
      context: 'The Lion King',
      imageSearch: 'lion king circle of life',
    }),
    card('dis-x-018', 'Almost there', 'quote', 'hard', {
      context: 'The Princess and the Frog',
      imageSearch: 'princess and the frog',
    }),
  ],
};
