import type { CharadesPack } from '../types.js';
import { card } from './helpers.js';

export const movieQuotesPack: CharadesPack = {
  id: 'movie-quotes',
  name: 'Movie Quotes',
  description: 'Famous lines from classic and modern films.',
  ageMin: 10,
  ageMax: null,
  cards: [
    card('mq-001', 'May the Force be with you', 'quote', 'easy', {
      year: 1977,
      actHint: 'Star Wars',
    }),
    card('mq-002', "I'll be back", 'quote', 'easy', { year: 1984, actHint: 'The Terminator' }),
    card('mq-003', 'You shall not pass', 'quote', 'easy', {
      year: 2001,
      actHint: 'The Lord of the Rings',
    }),
    card('mq-004', 'Houston, we have a problem', 'quote', 'easy', {
      year: 1995,
      actHint: 'Apollo 13',
    }),
    card('mq-005', 'To infinity and beyond', 'quote', 'easy', { year: 1995, actHint: 'Toy Story' }),
    card('mq-006', 'Just keep swimming', 'quote', 'easy', { year: 2003, actHint: 'Finding Nemo' }),
    card('mq-007', 'Why so serious?', 'quote', 'easy', { year: 2008, actHint: 'The Dark Knight' }),
    card('mq-008', 'I am Iron Man', 'quote', 'easy', { year: 2008, actHint: 'Iron Man' }),
    card('mq-009', 'Winter is coming', 'quote', 'easy', { year: 2011, actHint: 'Game of Thrones' }),
    card('mq-010', 'I see dead people', 'quote', 'easy', {
      year: 1999,
      actHint: 'The Sixth Sense',
    }),
    card('mq-011', 'Life is like a box of chocolates', 'quote', 'easy', {
      year: 1994,
      actHint: 'Forrest Gump',
    }),
    card('mq-012', 'You talking to me?', 'quote', 'easy', { year: 1976, actHint: 'Taxi Driver' }),
    card('mq-013', 'Show me the money', 'quote', 'easy', { year: 1996, actHint: 'Jerry Maguire' }),
    card('mq-014', 'There is no spoon', 'quote', 'easy', { year: 1999, actHint: 'The Matrix' }),
    card('mq-015', 'Hakuna matata', 'quote', 'easy', { year: 1994, actHint: 'The Lion King' }),
    card('mq-016', 'With great power comes great responsibility', 'quote', 'medium', {
      year: 2002,
      actHint: 'Spider-Man',
    }),
    card('mq-017', 'I feel the need for speed', 'quote', 'medium', {
      year: 1986,
      actHint: 'Top Gun',
    }),
    card('mq-018', 'Nobody puts Baby in a corner', 'quote', 'medium', {
      year: 1987,
      actHint: 'Dirty Dancing',
    }),
    card('mq-019', 'You had me at hello', 'quote', 'medium', {
      year: 1996,
      actHint: 'Jerry Maguire',
    }),
    card('mq-020', 'I am the king of the world', 'quote', 'medium', {
      year: 1997,
      actHint: 'Titanic',
    }),
    card('mq-021', 'Keep the change, ya filthy animal', 'quote', 'medium', {
      year: 1990,
      actHint: 'Home Alone',
    }),
    card('mq-022', 'As if!', 'quote', 'medium', { year: 1995, actHint: 'Clueless' }),
    card('mq-023', 'Say hello to my little friend', 'quote', 'medium', {
      year: 1983,
      actHint: 'Scarface',
    }),
    card('mq-024', 'I drink your milkshake', 'quote', 'medium', {
      year: 2007,
      actHint: 'There Will Be Blood',
    }),
    card('mq-025', 'I am Groot', 'quote', 'medium', {
      year: 2014,
      actHint: 'Guardians of the Galaxy',
    }),
    card('mq-026', 'Wakanda forever', 'quote', 'medium', { year: 2018, actHint: 'Black Panther' }),
    card('mq-027', 'We are Groot', 'quote', 'medium', {
      year: 2014,
      actHint: 'Guardians of the Galaxy',
    }),
    card('mq-028', 'This is the way', 'quote', 'medium', {
      year: 2019,
      actHint: 'The Mandalorian',
    }),
    card('mq-029', 'I am inevitable', 'quote', 'medium', {
      year: 2019,
      actHint: 'Avengers: Endgame',
    }),
    card('mq-030', 'On Wednesdays we wear pink', 'quote', 'medium', {
      year: 2004,
      actHint: 'Mean Girls',
    }),
    card('mq-031', 'Frankly, my dear, I do not give a damn', 'quote', 'hard', {
      year: 1939,
      actHint: 'Gone with the Wind',
    }),
    card('mq-032', 'Rosebud', 'quote', 'hard', { year: 1941, actHint: 'Citizen Kane' }),
    card('mq-033', 'Here is looking at you, kid', 'quote', 'hard', {
      year: 1942,
      actHint: 'Casablanca',
    }),
    card('mq-034', 'I coulda been a contender', 'quote', 'hard', {
      year: 1954,
      actHint: 'On the Waterfront',
    }),
    card('mq-035', 'They call me Mister Tibbs', 'quote', 'hard', {
      year: 1967,
      actHint: 'In the Heat of the Night',
    }),
    card('mq-036', 'E.T. phone home', 'quote', 'hard', { year: 1982, actHint: 'E.T.' }),
    card('mq-037', 'I love the smell of napalm in the morning', 'quote', 'hard', {
      year: 1979,
      actHint: 'Apocalypse Now',
    }),
    card('mq-038', 'I have always depended on the kindness of strangers', 'quote', 'hard', {
      year: 1951,
      actHint: 'A Streetcar Named Desire',
    }),
    card('mq-039', 'What we have here is failure to communicate', 'quote', 'hard', {
      year: 1967,
      actHint: 'Cool Hand Luke',
    }),
    card('mq-040', 'I am big. It is the pictures that got small', 'quote', 'hard', {
      year: 1950,
      actHint: 'Sunset Boulevard',
    }),
    card('mq-041', 'Fasten your seatbelts. It is going to be a bumpy night', 'quote', 'hard', {
      year: 1950,
      actHint: 'All About Eve',
    }),
    card('mq-042', 'After all, tomorrow is another day', 'quote', 'hard', {
      year: 1939,
      actHint: 'Gone with the Wind',
    }),
    card('mq-043', 'Round up the usual suspects', 'quote', 'hard', {
      year: 1942,
      actHint: 'Casablanca',
    }),
    card('mq-044', 'Open the pod bay doors, HAL', 'quote', 'hard', {
      year: 1968,
      actHint: '2001: A Space Odyssey',
    }),
    card('mq-045', 'I am mad as hell and I am not going to take this anymore', 'quote', 'hard', {
      year: 1976,
      actHint: 'Network',
    }),
    card('mq-046', 'Gentlemen, you cannot fight in here. This is the war room', 'quote', 'hard', {
      year: 1964,
      actHint: 'Dr. Strangelove',
    }),
    card('mq-047', 'Bond. James Bond', 'quote', 'hard', { year: 1962, actHint: 'Dr. No' }),
    card('mq-048', 'I see you', 'quote', 'hard', { year: 2009, actHint: 'Avatar' }),
    card('mq-049', 'I volunteer as tribute', 'quote', 'hard', {
      year: 2012,
      actHint: 'The Hunger Games',
    }),
    card('mq-050', 'Why did it have to be snakes?', 'quote', 'hard', {
      year: 1981,
      actHint: 'Raiders of the Lost Ark',
    }),
    card('mq-051', 'I am serious. And do not call me Shirley', 'quote', 'hard', {
      year: 1980,
      actHint: 'Airplane!',
    }),
    card('mq-052', 'They are here', 'quote', 'hard', { year: 1982, actHint: 'Poltergeist' }),
    card('mq-053', 'I have a bad feeling about this', 'quote', 'hard', {
      year: 1977,
      actHint: 'Star Wars',
    }),
    card('mq-054', 'You cannot handle the truth', 'quote', 'hard', {
      year: 1992,
      actHint: 'A Few Good Men',
    }),
    card('mq-055', 'I am walking here', 'quote', 'hard', {
      year: 1969,
      actHint: 'Midnight Cowboy',
    }),
    card('mq-056', 'Elementary, my dear Watson', 'quote', 'hard', {
      year: 1939,
      actHint: 'The Adventures of Sherlock Holmes',
    }),
    card('mq-057', 'I am your father', 'quote', 'hard', {
      year: 1980,
      actHint: 'The Empire Strikes Back',
    }),
    card('mq-058', 'Nobody expects the Spanish Inquisition', 'quote', 'hard', {
      year: 1970,
      actHint: 'Monty Python',
    }),
    card('mq-059', 'I have a particular set of skills', 'quote', 'hard', {
      year: 2008,
      actHint: 'Taken',
    }),
    card('mq-060', 'That is what she said', 'quote', 'hard', { year: 2005, actHint: 'The Office' }),
  ],
};
