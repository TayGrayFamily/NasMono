import type { CharadesPack } from '../types.js';
import { card } from './helpers.js';

/** Mixed movie pack — toggle titles, quotes, characters, and actors separately. */
export const moviesPack: CharadesPack = {
  id: 'movies',
  name: 'Movies',
  description: 'Titles, quotes, characters, and actors. Turn off any type you do not want.',
  ageMin: 8,
  ageMax: null,
  cards: [
    // Titles — easy
    card('mov-t-001', 'Frozen', 'title', 'easy'),
    card('mov-t-002', 'Toy Story', 'title', 'easy'),
    card('mov-t-003', 'The Lion King', 'title', 'easy'),
    card('mov-t-004', 'Shrek', 'title', 'easy'),
    card('mov-t-005', 'Finding Nemo', 'title', 'easy'),
    card('mov-t-006', 'Moana', 'title', 'easy'),
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
    card('mov-q-001', 'May the Force be with you', 'quote', 'easy', { year: 1977 }),
    card('mov-q-002', 'To infinity and beyond', 'quote', 'easy', { year: 1995 }),
    card('mov-q-003', 'Just keep swimming', 'quote', 'easy', { year: 2003 }),
    card('mov-q-004', 'Hakuna matata', 'quote', 'easy', { year: 1994 }),
    card('mov-q-005', 'I am Iron Man', 'quote', 'easy', { year: 2008 }),
    card('mov-q-006', "I'll be back", 'quote', 'easy', { year: 1984 }),
    // Quotes — medium
    card('mov-q-007', 'You had me at hello', 'quote', 'medium', { year: 1996 }),
    card('mov-q-008', 'I am the king of the world', 'quote', 'medium', { year: 1997 }),
    card('mov-q-009', 'Why so serious?', 'quote', 'medium', { year: 2008 }),
    card('mov-q-010', 'Wakanda forever', 'quote', 'medium', { year: 2018 }),
    card('mov-q-011', 'Show me the money', 'quote', 'medium', { year: 1996 }),
    card('mov-q-012', 'There is no spoon', 'quote', 'medium', { year: 1999 }),
    // Quotes — hard
    card('mov-q-013', 'Rosebud', 'quote', 'hard', { year: 1941 }),
    card('mov-q-014', 'Here is looking at you, kid', 'quote', 'hard', { year: 1942 }),
    card('mov-q-015', 'I coulda been a contender', 'quote', 'hard', { year: 1954 }),
    card('mov-q-016', 'Open the pod bay doors, HAL', 'quote', 'hard', { year: 1968 }),
    card('mov-q-017', 'Bond. James Bond', 'quote', 'hard', { year: 1962 }),
    card('mov-q-018', 'I am your father', 'quote', 'hard', { year: 1980 }),

    // Characters — easy
    card('mov-c-001', 'Elsa', 'character', 'easy', { actHint: 'Frozen' }),
    card('mov-c-002', 'Woody', 'character', 'easy', { actHint: 'Toy Story' }),
    card('mov-c-003', 'Buzz Lightyear', 'character', 'easy'),
    card('mov-c-004', 'Simba', 'character', 'easy'),
    card('mov-c-005', 'Shrek', 'character', 'easy'),
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
    card('mov-c-015', 'Rick Blaine', 'character', 'hard', { actHint: 'Casablanca' }),
    card('mov-c-016', 'Travis Bickle', 'character', 'hard', { actHint: 'Taxi Driver' }),
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
