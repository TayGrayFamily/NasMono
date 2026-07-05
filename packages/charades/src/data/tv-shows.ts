import type { CharadesPack } from '../types.js';
import { card } from './helpers.js';
import { tvExpansion } from './expansions/tv-expansion.js';

export const tvShowsPack: CharadesPack = {
  id: 'tv-shows',
  name: 'TV Shows',
  description: 'Series titles, iconic characters, and memorable lines.',
  ageMin: 10,
  ageMax: null,
  cards: [
    card('tv-t-001', 'Friends', 'title', 2, { imageSearch: 'friends tv show' }),
    card('tv-t-002', 'The Office', 'title', 3, { imageSearch: 'the office tv show' }),
    card('tv-t-003', 'SpongeBob SquarePants', 'title', 4, {
      imageSearch: 'spongebob squarepants',
    }),
    card('tv-t-004', 'The Simpsons', 'title', 1, { imageSearch: 'the simpsons' }),
    card('tv-t-005', 'Sesame Street', 'title', 2, { imageSearch: 'sesame street' }),
    card('tv-t-006', 'Bluey', 'title', 3, { imageSearch: 'bluey tv show' }),
    card('tv-t-007', 'Stranger Things', 'title', 7, { imageSearch: 'stranger things' }),
    card('tv-t-008', 'Breaking Bad', 'title', 4, { imageSearch: 'breaking bad' }),
    card('tv-t-009', 'Game of Thrones', 'title', 5, { imageSearch: 'game of thrones' }),
    card('tv-t-010', 'The Mandalorian', 'title', 7, { imageSearch: 'the mandalorian' }),
    card('tv-t-011', 'Parks and Recreation', 'title', 4, {
      imageSearch: 'parks and recreation',
    }),
    card('tv-t-012', 'The Great British Bake Off', 'title', 5, {
      imageSearch: 'great british bake off',
    }),
    card('tv-t-013', 'The Twilight Zone', 'title', 9, { imageSearch: 'twilight zone' }),
    card('tv-t-014', 'Twin Peaks', 'title', 10, { imageSearch: 'twin peaks' }),
    card('tv-t-015', 'The Sopranos', 'title', 7, { imageSearch: 'the sopranos' }),
    card('tv-t-016', 'Mad Men', 'title', 8, { imageSearch: 'mad men' }),
    card('tv-t-017', 'The Wire', 'title', 9, { imageSearch: 'the wire tv' }),
    card('tv-t-018', 'Arrested Development', 'title', 10, {
      imageSearch: 'arrested development',
    }),

    card('tv-c-001', 'Ross Geller', 'character', 1, {
      context: 'Friends',
      imageSearch: 'ross geller friends',
    }),
    card('tv-c-002', 'Michael Scott', 'character', 2, {
      context: 'The Office',
      imageSearch: 'michael scott the office',
    }),
    card('tv-c-003', 'SpongeBob', 'character', 3, { imageSearch: 'spongebob' }),
    card('tv-c-004', 'Homer Simpson', 'character', 4, { imageSearch: 'homer simpson' }),
    card('tv-c-005', 'Elmo', 'character', 1, { imageSearch: 'elmo sesame street' }),
    card('tv-c-006', 'Bluey', 'character', 2, { imageSearch: 'bluey cartoon' }),
    card('tv-c-007', 'Eleven', 'character', 6, {
      context: 'Stranger Things',
      imageSearch: 'eleven stranger things',
    }),
    card('tv-c-008', 'Walter White', 'character', 7, {
      context: 'Breaking Bad',
      imageSearch: 'walter white breaking bad',
    }),
    card('tv-c-009', 'Tyrion Lannister', 'character', 4, {
      context: 'Game of Thrones',
      imageSearch: 'tyrion lannister',
    }),
    card('tv-c-010', 'The Mandalorian', 'character', 6, {
      context: 'The Mandalorian',
      imageSearch: 'the mandalorian grogu',
    }),
    card('tv-c-011', 'Leslie Knope', 'character', 7, {
      context: 'Parks and Recreation',
      imageSearch: 'leslie knope',
    }),
    card('tv-c-012', 'Dwight Schrute', 'character', 4, {
      context: 'The Office',
      imageSearch: 'dwight schrute',
    }),
    card('tv-c-013', 'Tony Soprano', 'character', 8, {
      context: 'The Sopranos',
      imageSearch: 'tony soprano',
    }),
    card('tv-c-014', 'Don Draper', 'character', 9, {
      context: 'Mad Men',
      imageSearch: 'don draper',
    }),
    card('tv-c-015', 'Omar Little', 'character', 10, {
      context: 'The Wire',
      imageSearch: 'omar little the wire',
    }),
    card('tv-c-016', 'Dale Cooper', 'character', 7, {
      context: 'Twin Peaks',
      imageSearch: 'agent cooper twin peaks',
    }),
    card('tv-c-017', 'Lucille Bluth', 'character', 8, {
      context: 'Arrested Development',
      imageSearch: 'lucille bluth',
    }),
    card('tv-c-018', 'Stringer Bell', 'character', 9, {
      context: 'The Wire',
      imageSearch: 'stringer bell',
    }),

    card('tv-q-001', 'How you doin?', 'quote', 3, {
      context: 'Friends',
      imageSearch: 'joey friends how you doin',
    }),
    card('tv-q-002', "That's what she said", 'quote', 4, {
      context: 'The Office',
      imageSearch: 'michael scott thats what she said',
    }),
    card('tv-q-003', 'Bears. Beets. Battlestar Galactica.', 'quote', 1, {
      context: 'The Office',
      imageSearch: 'dwight schrute bears beets',
    }),
    card('tv-q-004', 'Winter is coming', 'quote', 2, {
      context: 'Game of Thrones',
      imageSearch: 'game of thrones winter is coming',
    }),
    card('tv-q-005', 'Bazinga', 'quote', 3, {
      context: 'The Big Bang Theory',
      imageSearch: 'sheldon bazinga',
    }),
    card('tv-q-006', 'This is the way', 'quote', 4, {
      context: 'The Mandalorian',
      imageSearch: 'mandalorian this is the way',
    }),
    card('tv-q-007', 'I am the one who knocks', 'quote', 4, {
      context: 'Breaking Bad',
      imageSearch: 'walter white i am the one who knocks',
    }),
    card('tv-q-008', 'Pivot!', 'quote', 5, {
      context: 'Friends',
      imageSearch: 'friends pivot couch',
    }),
    card('tv-q-009', 'Treat yo self', 'quote', 6, {
      context: 'Parks and Recreation',
      imageSearch: 'treat yo self parks and rec',
    }),
    card('tv-q-010', 'I declare bankruptcy', 'quote', 4, {
      context: 'The Office',
      imageSearch: 'michael scott bankruptcy',
    }),
    card('tv-q-011', 'The north remembers', 'quote', 5, {
      context: 'Game of Thrones',
      imageSearch: 'game of thrones',
    }),
    card('tv-q-012', 'No soup for you', 'quote', 6, {
      context: 'Seinfeld',
      imageSearch: 'seinfeld soup nazi',
    }),
    card('tv-q-013', 'I am not a crook', 'quote', 10, {
      context: 'Richard Nixon',
      imageSearch: 'nixon not a crook',
    }),
    card('tv-q-014', 'The truth is out there', 'quote', 7, {
      context: 'The X-Files',
      imageSearch: 'x-files truth is out there',
    }),
    card('tv-q-015', 'Live long and prosper', 'quote', 8, {
      context: 'Star Trek',
      imageSearch: 'spock live long prosper',
    }),
    card('tv-q-016', 'Darmok and Jalad at Tanagra', 'quote', 9, {
      context: 'Star Trek: The Next Generation',
      imageSearch: 'star trek darmok',
    }),
    card('tv-q-017', 'I have a cunning plan', 'quote', 10, {
      context: 'Blackadder',
      imageSearch: 'blackadder cunning plan',
    }),
    card('tv-q-018', 'Smelly cat', 'quote', 7, {
      context: 'Friends',
      imageSearch: 'phoebe smelly cat',
    }),
    ...tvExpansion,
  ],
};
