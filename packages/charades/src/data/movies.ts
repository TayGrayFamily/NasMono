import type { CharadesPack } from '../types.js';
import { card } from './helpers.js';
import { GENS_ALL, GENS_CLASSIC, GENS_RECENT } from './generation-tags.js';

/** Mixed movie pack — toggle titles, quotes, characters, and actors separately. */
export const moviesPack: CharadesPack = {
  id: 'movies',
  name: 'Movies',
  description: 'Titles, quotes, characters, and actors. Turn off any type you do not want.',
  ageMin: 8,
  ageMax: null,
  cards: [
    // Titles — easy
    card('mov-t-001', 'Frozen', 'title', 'easy', {
      emoji: '❄️',
      context: 'Disney animated film, 2013',
      imageSearch: 'frozen elsa disney',
      guessHint: 'Let it go…',
    }),
    card('mov-t-002', 'Toy Story', 'title', 'easy', {
      emoji: '🤠',
      context: 'Pixar, 1995',
      imageSearch: 'toy story woody buzz',
    }),
    card('mov-t-003', 'The Lion King', 'title', 'easy', {
      emoji: '🦁',
      context: 'Disney animated film, 1994',
      imageSearch: 'lion king simba',
    }),
    card('mov-t-004', 'Shrek', 'title', 'easy', {
      emoji: '🧅',
      context: 'DreamWorks, 2001',
      imageSearch: 'shrek ogre',
    }),
    card('mov-t-005', 'Finding Nemo', 'title', 'easy', {
      emoji: '🐠',
      context: 'Pixar, 2003',
      imageSearch: 'finding nemo clownfish',
    }),
    card('mov-t-006', 'Moana', 'title', 'easy', {
      emoji: '🌊',
      context: 'Disney, 2016',
      imageSearch: 'moana disney',
    }),
    // Titles — medium
    card('mov-t-007', 'Jurassic Park', 'title', 'medium'),
    card('mov-t-008', 'The Matrix', 'title', 'medium'),
    card('mov-t-009', 'Inception', 'title', 'medium'),
    card('mov-t-010', 'Ghostbusters', 'title', 'medium'),
    card('mov-t-011', 'Back to the Future', 'title', 'medium'),
    card('mov-t-012', 'The Dark Knight', 'title', 'medium'),
    // Titles — hard
    card('mov-t-013', 'Citizen Kane', 'title', 'hard'),
    card('mov-t-014', 'Casablanca', 'title', 'hard'),
    card('mov-t-015', 'Apocalypse Now', 'title', 'hard'),
    card('mov-t-016', 'Chinatown', 'title', 'hard'),
    card('mov-t-017', 'The Godfather', 'title', 'hard'),
    card('mov-t-018', 'Pulp Fiction', 'title', 'hard'),

    // Quotes — easy
    card('mov-q-001', 'May the Force be with you', 'quote', 'easy', {
      context: 'Star Wars',
      generations: GENS_ALL,
      imageSearch: 'star wars lightsaber',
      guessHint: 'Space opera with Jedi',
    }),
    card('mov-q-002', 'To infinity and beyond', 'quote', 'easy', {
      context: 'Toy Story',
      generations: GENS_ALL,
    }),
    card('mov-q-003', 'Just keep swimming', 'quote', 'easy', {
      context: 'Finding Nemo',
      generations: GENS_ALL,
    }),
    card('mov-q-004', 'Hakuna matata', 'quote', 'easy', {
      context: 'The Lion King',
      generations: GENS_ALL,
    }),
    card('mov-q-005', 'I am Iron Man', 'quote', 'easy', {
      context: 'Iron Man',
      generations: GENS_ALL,
    }),
    card('mov-q-006', "I'll be back", 'quote', 'easy', {
      context: 'The Terminator',
      generations: GENS_ALL,
    }),
    card('mov-q-019', 'You shall not pass', 'quote', 'easy', {
      context: 'The Lord of the Rings',
      generations: GENS_ALL,
    }),
    card('mov-q-020', 'Houston, we have a problem', 'quote', 'easy', {
      context: 'Apollo 13',
      generations: GENS_ALL,
    }),
    card('mov-q-021', 'I see dead people', 'quote', 'easy', {
      context: 'The Sixth Sense',
      generations: GENS_ALL,
    }),
    card('mov-q-022', 'Life is like a box of chocolates', 'quote', 'easy', {
      context: 'Forrest Gump',
      generations: GENS_ALL,
    }),
    card('mov-q-023', 'You talking to me?', 'quote', 'easy', {
      context: 'Taxi Driver',
      generations: GENS_ALL,
    }),
    // Quotes — medium
    card('mov-q-007', 'You had me at hello', 'quote', 'medium', {
      context: 'Jerry Maguire',
      generations: GENS_ALL,
    }),
    card('mov-q-008', 'I am the king of the world', 'quote', 'medium', {
      context: 'Titanic',
      generations: GENS_ALL,
    }),
    card('mov-q-009', 'Why so serious?', 'quote', 'medium', {
      context: 'The Dark Knight',
      generations: GENS_ALL,
    }),
    card('mov-q-010', 'Wakanda forever', 'quote', 'medium', {
      context: 'Black Panther',
      generations: GENS_RECENT,
    }),
    card('mov-q-011', 'Show me the money', 'quote', 'medium', {
      context: 'Jerry Maguire',
      generations: GENS_ALL,
    }),
    card('mov-q-012', 'There is no spoon', 'quote', 'medium', {
      context: 'The Matrix',
      generations: GENS_ALL,
    }),
    card('mov-q-024', 'With great power comes great responsibility', 'quote', 'medium', {
      context: 'Spider-Man',
      generations: GENS_ALL,
    }),
    card('mov-q-025', 'Nobody puts Baby in a corner', 'quote', 'medium', {
      context: 'Dirty Dancing',
      generations: GENS_ALL,
    }),
    card('mov-q-026', 'I am Groot', 'quote', 'medium', {
      context: 'Guardians of the Galaxy',
      generations: GENS_RECENT,
    }),
    card('mov-q-027', 'On Wednesdays we wear pink', 'quote', 'medium', {
      context: 'Mean Girls',
      generations: GENS_ALL,
    }),
    card('mov-q-028', 'You cannot handle the truth', 'quote', 'medium', {
      context: 'A Few Good Men',
      generations: GENS_ALL,
    }),
    // Quotes — hard
    card('mov-q-013', 'Rosebud', 'quote', 'hard', {
      context: 'Citizen Kane',
      generations: GENS_CLASSIC,
    }),
    card('mov-q-014', 'Here is looking at you, kid', 'quote', 'hard', {
      context: 'Casablanca',
      generations: GENS_CLASSIC,
    }),
    card('mov-q-015', 'I coulda been a contender', 'quote', 'hard', {
      context: 'On the Waterfront',
      generations: GENS_CLASSIC,
    }),
    card('mov-q-016', 'Open the pod bay doors, HAL', 'quote', 'hard', {
      context: '2001: A Space Odyssey',
      generations: GENS_CLASSIC,
    }),
    card('mov-q-017', 'Bond. James Bond', 'quote', 'hard', {
      context: 'James Bond',
      generations: GENS_CLASSIC,
    }),
    card('mov-q-018', 'I am your father', 'quote', 'hard', {
      context: 'The Empire Strikes Back',
      generations: GENS_ALL,
    }),
    card('mov-q-029', 'E.T. phone home', 'quote', 'hard', {
      context: 'E.T.',
      generations: GENS_ALL,
    }),
    card('mov-q-030', 'I volunteer as tribute', 'quote', 'hard', {
      context: 'The Hunger Games',
      generations: GENS_RECENT,
    }),
    card('mov-q-031', 'Frankly, my dear, I do not give a damn', 'quote', 'hard', {
      context: 'Gone with the Wind',
      generations: GENS_CLASSIC,
    }),
    card('mov-q-032', 'Elementary, my dear Watson', 'quote', 'hard', {
      context: 'Sherlock Holmes',
      generations: GENS_CLASSIC,
    }),
    card('mov-q-033', 'I have a particular set of skills', 'quote', 'hard', {
      context: 'Taken',
      generations: GENS_ALL,
    }),

    // Characters — easy
    card('mov-c-001', 'Elsa', 'character', 'easy', { context: 'Frozen' }),
    card('mov-c-002', 'Woody', 'character', 'easy', { context: 'Toy Story' }),
    card('mov-c-003', 'Buzz Lightyear', 'character', 'easy'),
    card('mov-c-004', 'Simba', 'character', 'easy'),
    card('mov-c-005', 'Donkey', 'character', 'easy', { context: 'Shrek' }),
    card('mov-c-006', 'Nemo', 'character', 'easy'),
    // Characters — medium
    card('mov-c-007', 'Indiana Jones', 'character', 'medium'),
    card('mov-c-008', 'Luke Skywalker', 'character', 'medium'),
    card('mov-c-009', 'Jack Sparrow', 'character', 'medium'),
    card('mov-c-010', 'Harry Potter', 'character', 'medium'),
    card('mov-c-011', 'Katniss Everdeen', 'character', 'medium'),
    card('mov-c-012', 'Tony Stark', 'character', 'medium'),
    // Characters — hard
    card('mov-c-013', 'Don Corleone', 'character', 'hard'),
    card('mov-c-014', 'Hannibal Lecter', 'character', 'hard'),
    card('mov-c-015', 'Rick Blaine', 'character', 'hard', { context: 'Casablanca' }),
    card('mov-c-016', 'Travis Bickle', 'character', 'hard', { context: 'Taxi Driver' }),
    card('mov-c-017', 'Norman Bates', 'character', 'hard'),
    card('mov-c-018', "Scarlett O'Hara", 'character', 'hard'),

    // Actors — easy
    card('mov-a-001', 'Tom Hanks', 'actor', 'easy'),
    card('mov-a-002', 'Will Smith', 'actor', 'easy'),
    card('mov-a-003', 'Dwayne Johnson', 'actor', 'easy'),
    card('mov-a-004', 'Jennifer Lawrence', 'actor', 'easy'),
    card('mov-a-005', 'Ryan Reynolds', 'actor', 'easy'),
    card('mov-a-006', 'Emma Stone', 'actor', 'easy'),
    // Actors — medium
    card('mov-a-007', 'Meryl Streep', 'actor', 'medium'),
    card('mov-a-008', 'Leonardo DiCaprio', 'actor', 'medium'),
    card('mov-a-009', 'Denzel Washington', 'actor', 'medium'),
    card('mov-a-010', 'Cate Blanchett', 'actor', 'medium'),
    card('mov-a-011', 'Samuel L. Jackson', 'actor', 'medium'),
    card('mov-a-012', 'Sandra Bullock', 'actor', 'medium'),
    // Actors — hard
    card('mov-a-013', 'Humphrey Bogart', 'actor', 'hard'),
    card('mov-a-014', 'Audrey Hepburn', 'actor', 'hard'),
    card('mov-a-015', 'Marlon Brando', 'actor', 'hard'),
    card('mov-a-016', 'Bette Davis', 'actor', 'hard'),
    card('mov-a-017', 'Cary Grant', 'actor', 'hard'),
    card('mov-a-018', 'Katharine Hepburn', 'actor', 'hard'),
  ],
};
