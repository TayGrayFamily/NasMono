import type { CharadesPack } from '../types.js';
import { card } from './helpers.js';
import { GENS_ALL, GENS_CLASSIC, GENS_RECENT } from './generation-tags.js';
import { moviesExpansion } from './expansions/movies-expansion.js';

/** Mixed movie pack — toggle titles, quotes, characters, and actors separately. */
export const moviesPack: CharadesPack = {
  id: 'movies',
  name: 'Movies',
  description: 'Titles, quotes, characters, and actors. Turn off any type you do not want.',
  ageMin: 8,
  ageMax: null,
  cards: [
    // Titles — easy
    card('mov-t-001', 'Frozen', 'title', 4, {
      emoji: '❄️',
      context: 'Disney animated film, 2013',
      imageSearch: 'frozen elsa disney',
      guessHint: 'Let it go…',
    }),
    card('mov-t-002', 'Toy Story', 'title', 1, {
      emoji: '🤠',
      context: 'Pixar, 1995',
      imageSearch: 'toy story woody buzz',
    }),
    card('mov-t-003', 'The Lion King', 'title', 2, {
      emoji: '🦁',
      context: 'Disney animated film, 1994',
      imageSearch: 'lion king simba',
    }),
    card('mov-t-004', 'Shrek', 'title', 3, {
      emoji: '🧅',
      context: 'DreamWorks, 2001',
      imageSearch: 'shrek ogre',
    }),
    card('mov-t-005', 'Finding Nemo', 'title', 4, {
      emoji: '🐠',
      context: 'Pixar, 2003',
      imageSearch: 'finding nemo clownfish',
    }),
    card('mov-t-006', 'Moana', 'title', 1, {
      emoji: '🌊',
      context: 'Disney, 2016',
      imageSearch: 'moana disney',
    }),
    // Titles — medium
    card('mov-t-007', 'Jurassic Park', 'title', 5, {
      emoji: '🦖',
      imageSearch: 'jurassic park dinosaur',
    }),
    card('mov-t-008', 'The Matrix', 'title', 6, {
      emoji: '💊',
      imageSearch: 'the matrix movie',
    }),
    card('mov-t-009', 'Inception', 'title', 7, {
      emoji: '🌀',
      imageSearch: 'inception movie spinning top',
    }),
    card('mov-t-010', 'Ghostbusters', 'title', 5, {
      emoji: '👻',
      imageSearch: 'ghostbusters',
    }),
    card('mov-t-011', 'Back to the Future', 'title', 6, {
      emoji: '⚡',
      imageSearch: 'back to the future delorean',
    }),
    card('mov-t-012', 'The Dark Knight', 'title', 7, {
      emoji: '🦇',
      imageSearch: 'dark knight batman',
    }),
    // Titles — hard
    card('mov-t-013', 'Citizen Kane', 'title', 7, { imageSearch: 'citizen kane rosebud' }),
    card('mov-t-014', 'Casablanca', 'title', 8, { imageSearch: 'casablanca movie' }),
    card('mov-t-015', 'Apocalypse Now', 'title', 9, { imageSearch: 'apocalypse now' }),
    card('mov-t-016', 'Chinatown', 'title', 10, { imageSearch: 'chinatown movie' }),
    card('mov-t-017', 'The Godfather', 'title', 7, {
      emoji: '🎩',
      imageSearch: 'the godfather',
    }),
    card('mov-t-018', 'Pulp Fiction', 'title', 8, {
      emoji: '💼',
      imageSearch: 'pulp fiction movie',
    }),

    // Quotes — easy
    card('mov-q-001', 'May the Force be with you', 'quote', 1, {
      context: 'Star Wars',
      generations: GENS_ALL,
      imageSearch: 'star wars lightsaber',
      guessHint: 'Space opera with Jedi',
    }),
    card('mov-q-002', 'To infinity and beyond', 'quote', 2, {
      context: 'Toy Story',
      generations: GENS_ALL,
      imageSearch: 'toy story buzz lightyear',
    }),
    card('mov-q-003', 'Just keep swimming', 'quote', 3, {
      context: 'Finding Nemo',
      generations: GENS_ALL,
      imageSearch: 'finding nemo dory',
    }),
    card('mov-q-004', 'Hakuna matata', 'quote', 4, {
      context: 'The Lion King',
      generations: GENS_ALL,
      imageSearch: 'lion king timon pumbaa',
    }),
    card('mov-q-005', 'I am Iron Man', 'quote', 1, {
      context: 'Iron Man',
      generations: GENS_ALL,
      imageSearch: 'iron man marvel',
    }),
    card('mov-q-006', "I'll be back", 'quote', 2, {
      context: 'The Terminator',
      generations: GENS_ALL,
      imageSearch: 'terminator arnold',
    }),
    card('mov-q-019', 'You shall not pass', 'quote', 4, {
      context: 'The Lord of the Rings',
      generations: GENS_ALL,
      imageSearch: 'gandalf you shall not pass',
    }),
    card('mov-q-020', 'Houston, we have a problem', 'quote', 2, {
      context: 'Apollo 13',
      generations: GENS_ALL,
      imageSearch: 'apollo 13 movie',
    }),
    card('mov-q-021', 'I see dead people', 'quote', 3, {
      context: 'The Sixth Sense',
      generations: GENS_ALL,
      imageSearch: 'sixth sense movie',
    }),
    card('mov-q-022', 'Life is like a box of chocolates', 'quote', 4, {
      context: 'Forrest Gump',
      generations: GENS_ALL,
      imageSearch: 'forrest gump',
    }),
    card('mov-q-023', 'You talking to me?', 'quote', 1, {
      context: 'Taxi Driver',
      generations: GENS_ALL,
      imageSearch: 'taxi driver robert de niro',
    }),
    // Quotes — medium
    card('mov-q-007', 'You had me at hello', 'quote', 6, {
      context: 'Jerry Maguire',
      generations: GENS_ALL,
      imageSearch: 'jerry maguire',
    }),
    card('mov-q-008', 'I am the king of the world', 'quote', 7, {
      context: 'Titanic',
      generations: GENS_ALL,
      imageSearch: 'titanic movie',
    }),
    card('mov-q-009', 'Why so serious?', 'quote', 4, {
      context: 'The Dark Knight',
      generations: GENS_ALL,
      imageSearch: 'joker dark knight',
    }),
    card('mov-q-010', 'Wakanda forever', 'quote', 6, {
      context: 'Black Panther',
      generations: GENS_RECENT,
      imageSearch: 'black panther wakanda',
    }),
    card('mov-q-011', 'Show me the money', 'quote', 7, {
      context: 'Jerry Maguire',
      generations: GENS_ALL,
      imageSearch: 'show me the money jerry maguire',
    }),
    card('mov-q-012', 'There is no spoon', 'quote', 4, {
      context: 'The Matrix',
      generations: GENS_ALL,
      imageSearch: 'matrix there is no spoon',
    }),
    card('mov-q-024', 'With great power comes great responsibility', 'quote', 5, {
      context: 'Spider-Man',
      generations: GENS_ALL,
      imageSearch: 'spider-man marvel',
    }),
    card('mov-q-025', 'Nobody puts Baby in a corner', 'quote', 6, {
      context: 'Dirty Dancing',
      generations: GENS_ALL,
      imageSearch: 'dirty dancing',
    }),
    card('mov-q-026', 'I am Groot', 'quote', 7, {
      context: 'Guardians of the Galaxy',
      generations: GENS_RECENT,
      imageSearch: 'groot guardians of the galaxy',
    }),
    card('mov-q-027', 'On Wednesdays we wear pink', 'quote', 4, {
      context: 'Mean Girls',
      generations: GENS_ALL,
      imageSearch: 'mean girls',
    }),
    card('mov-q-028', 'You cannot handle the truth', 'quote', 5, {
      context: 'A Few Good Men',
      generations: GENS_ALL,
      imageSearch: 'a few good men',
    }),
    // Quotes — hard
    card('mov-q-013', 'Rosebud', 'quote', 8, {
      context: 'Citizen Kane',
      generations: GENS_CLASSIC,
      imageSearch: 'citizen kane rosebud',
    }),
    card('mov-q-014', 'Here is looking at you, kid', 'quote', 9, {
      context: 'Casablanca',
      generations: GENS_CLASSIC,
      imageSearch: 'casablanca',
    }),
    card('mov-q-015', 'I coulda been a contender', 'quote', 10, {
      context: 'On the Waterfront',
      generations: GENS_CLASSIC,
      imageSearch: 'on the waterfront',
    }),
    card('mov-q-016', 'Open the pod bay doors, HAL', 'quote', 7, {
      context: '2001: A Space Odyssey',
      generations: GENS_CLASSIC,
      imageSearch: '2001 a space odyssey hal',
    }),
    card('mov-q-017', 'Bond. James Bond', 'quote', 8, {
      context: 'James Bond',
      generations: GENS_CLASSIC,
      imageSearch: 'james bond',
    }),
    card('mov-q-018', 'I am your father', 'quote', 9, {
      context: 'The Empire Strikes Back',
      generations: GENS_ALL,
      imageSearch: 'darth vader luke i am your father',
    }),
    card('mov-q-029', 'E.T. phone home', 'quote', 9, {
      context: 'E.T.',
      generations: GENS_ALL,
      imageSearch: 'et phone home',
    }),
    card('mov-q-030', 'I volunteer as tribute', 'quote', 7, {
      context: 'The Hunger Games',
      generations: GENS_RECENT,
      imageSearch: 'hunger games katniss',
    }),
    card('mov-q-031', 'Frankly, my dear, I do not give a damn', 'quote', 8, {
      context: 'Gone with the Wind',
      generations: GENS_CLASSIC,
      imageSearch: 'gone with the wind',
    }),
    card('mov-q-032', 'Elementary, my dear Watson', 'quote', 9, {
      context: 'Sherlock Holmes',
      generations: GENS_CLASSIC,
      imageSearch: 'sherlock holmes',
    }),
    card('mov-q-033', 'I have a particular set of skills', 'quote', 10, {
      context: 'Taken',
      generations: GENS_ALL,
      imageSearch: 'taken liam neeson',
    }),

    // Characters — easy
    card('mov-c-001', 'Elsa', 'character', 3, {
      context: 'Frozen',
      emoji: '❄️',
      imageSearch: 'elsa frozen disney',
    }),
    card('mov-c-002', 'Woody', 'character', 4, {
      context: 'Toy Story',
      emoji: '🤠',
      imageSearch: 'woody toy story',
    }),
    card('mov-c-003', 'Buzz Lightyear', 'character', 1, {
      context: 'Toy Story',
      emoji: '🚀',
      imageSearch: 'buzz lightyear',
    }),
    card('mov-c-004', 'Simba', 'character', 2, {
      context: 'The Lion King',
      emoji: '🦁',
      imageSearch: 'simba lion king',
    }),
    card('mov-c-005', 'Donkey', 'character', 3, {
      context: 'Shrek',
      emoji: '🫏',
      imageSearch: 'donkey shrek',
    }),
    card('mov-c-006', 'Nemo', 'character', 4, {
      context: 'Finding Nemo',
      emoji: '🐠',
      imageSearch: 'nemo finding nemo',
    }),
    // Characters — medium
    card('mov-c-007', 'Indiana Jones', 'character', 4, {
      emoji: '🤠',
      imageSearch: 'indiana jones',
    }),
    card('mov-c-008', 'Luke Skywalker', 'character', 5, {
      context: 'Star Wars',
      imageSearch: 'luke skywalker',
    }),
    card('mov-c-009', 'Jack Sparrow', 'character', 6, {
      context: 'Pirates of the Caribbean',
      emoji: '🏴‍☠️',
      imageSearch: 'jack sparrow',
    }),
    card('mov-c-010', 'Harry Potter', 'character', 4, {
      emoji: '⚡',
      imageSearch: 'harry potter',
    }),
    card('mov-c-011', 'Katniss Everdeen', 'character', 5, {
      context: 'The Hunger Games',
      imageSearch: 'katniss everdeen',
    }),
    card('mov-c-012', 'Tony Stark', 'character', 6, {
      context: 'Iron Man',
      imageSearch: 'tony stark iron man',
    }),
    // Characters — hard
    card('mov-c-013', 'Don Corleone', 'character', 10, {
      context: 'The Godfather',
      imageSearch: 'don corleone godfather',
    }),
    card('mov-c-014', 'Hannibal Lecter', 'character', 7, {
      context: 'The Silence of the Lambs',
      imageSearch: 'hannibal lecter',
    }),
    card('mov-c-015', 'Rick Blaine', 'character', 8, {
      context: 'Casablanca',
      imageSearch: 'casablanca humphrey bogart',
    }),
    card('mov-c-016', 'Travis Bickle', 'character', 9, {
      context: 'Taxi Driver',
      imageSearch: 'taxi driver',
    }),
    card('mov-c-017', 'Norman Bates', 'character', 10, {
      context: 'Psycho',
      imageSearch: 'psycho norman bates',
    }),
    card('mov-c-018', "Scarlett O'Hara", 'character', 7, {
      context: 'Gone with the Wind',
      imageSearch: 'gone with the wind scarlett',
    }),

    // Actors — easy
    card('mov-a-001', 'Tom Hanks', 'actor', 1, { imageSearch: 'tom hanks' }),
    card('mov-a-002', 'Will Smith', 'actor', 2, { imageSearch: 'will smith' }),
    card('mov-a-003', 'Dwayne Johnson', 'actor', 3, { imageSearch: 'dwayne johnson' }),
    card('mov-a-004', 'Jennifer Lawrence', 'actor', 4, {
      imageSearch: 'jennifer lawrence',
    }),
    card('mov-a-005', 'Ryan Reynolds', 'actor', 1, { imageSearch: 'ryan reynolds' }),
    card('mov-a-006', 'Emma Stone', 'actor', 2, { imageSearch: 'emma stone' }),
    // Actors — medium
    card('mov-a-007', 'Meryl Streep', 'actor', 6, { imageSearch: 'meryl streep' }),
    card('mov-a-008', 'Leonardo DiCaprio', 'actor', 7, {
      imageSearch: 'leonardo dicaprio',
    }),
    card('mov-a-009', 'Denzel Washington', 'actor', 4, {
      imageSearch: 'denzel washington',
    }),
    card('mov-a-010', 'Cate Blanchett', 'actor', 6, { imageSearch: 'cate blanchett' }),
    card('mov-a-011', 'Samuel L. Jackson', 'actor', 7, {
      imageSearch: 'samuel l jackson',
    }),
    card('mov-a-012', 'Sandra Bullock', 'actor', 4, { imageSearch: 'sandra bullock' }),
    // Actors — hard
    card('mov-a-013', 'Humphrey Bogart', 'actor', 8, { imageSearch: 'humphrey bogart' }),
    card('mov-a-014', 'Audrey Hepburn', 'actor', 9, { imageSearch: 'audrey hepburn' }),
    card('mov-a-015', 'Marlon Brando', 'actor', 10, { imageSearch: 'marlon brando' }),
    card('mov-a-016', 'Bette Davis', 'actor', 7, { imageSearch: 'bette davis' }),
    card('mov-a-017', 'Cary Grant', 'actor', 8, { imageSearch: 'cary grant' }),
    card('mov-a-018', 'Katharine Hepburn', 'actor', 9, {
      imageSearch: 'katharine hepburn',
    }),
    ...moviesExpansion,
  ],
};
