import type { CharadesPack } from '../types.js';
import { card } from './helpers.js';

export const tvShowsPack: CharadesPack = {
  id: 'tv-shows',
  name: 'TV Shows',
  description: 'Series titles, iconic characters, and memorable lines.',
  ageMin: 10,
  ageMax: null,
  cards: [
    card('tv-t-001', 'Friends', 'title', 'easy', { imageSearch: 'friends tv show' }),
    card('tv-t-002', 'The Office', 'title', 'easy', { imageSearch: 'the office tv show' }),
    card('tv-t-003', 'SpongeBob SquarePants', 'title', 'easy', {
      imageSearch: 'spongebob squarepants',
    }),
    card('tv-t-004', 'The Simpsons', 'title', 'easy', { imageSearch: 'the simpsons' }),
    card('tv-t-005', 'Sesame Street', 'title', 'easy', { imageSearch: 'sesame street' }),
    card('tv-t-006', 'Bluey', 'title', 'easy', { imageSearch: 'bluey tv show' }),
    card('tv-t-007', 'Stranger Things', 'title', 'medium', { imageSearch: 'stranger things' }),
    card('tv-t-008', 'Breaking Bad', 'title', 'medium', { imageSearch: 'breaking bad' }),
    card('tv-t-009', 'Game of Thrones', 'title', 'medium', { imageSearch: 'game of thrones' }),
    card('tv-t-010', 'The Mandalorian', 'title', 'medium', { imageSearch: 'the mandalorian' }),
    card('tv-t-011', 'Parks and Recreation', 'title', 'medium', {
      imageSearch: 'parks and recreation',
    }),
    card('tv-t-012', 'The Great British Bake Off', 'title', 'medium', {
      imageSearch: 'great british bake off',
    }),
    card('tv-t-013', 'The Twilight Zone', 'title', 'hard', { imageSearch: 'twilight zone' }),
    card('tv-t-014', 'Twin Peaks', 'title', 'hard', { imageSearch: 'twin peaks' }),
    card('tv-t-015', 'The Sopranos', 'title', 'hard', { imageSearch: 'the sopranos' }),
    card('tv-t-016', 'Mad Men', 'title', 'hard', { imageSearch: 'mad men' }),
    card('tv-t-017', 'The Wire', 'title', 'hard', { imageSearch: 'the wire tv' }),
    card('tv-t-018', 'Arrested Development', 'title', 'hard', {
      imageSearch: 'arrested development',
    }),

    card('tv-c-001', 'Ross Geller', 'character', 'easy', {
      context: 'Friends',
      imageSearch: 'ross geller friends',
    }),
    card('tv-c-002', 'Michael Scott', 'character', 'easy', {
      context: 'The Office',
      imageSearch: 'michael scott the office',
    }),
    card('tv-c-003', 'SpongeBob', 'character', 'easy', { imageSearch: 'spongebob' }),
    card('tv-c-004', 'Homer Simpson', 'character', 'easy', { imageSearch: 'homer simpson' }),
    card('tv-c-005', 'Elmo', 'character', 'easy', { imageSearch: 'elmo sesame street' }),
    card('tv-c-006', 'Bluey', 'character', 'easy', { imageSearch: 'bluey cartoon' }),
    card('tv-c-007', 'Eleven', 'character', 'medium', {
      context: 'Stranger Things',
      imageSearch: 'eleven stranger things',
    }),
    card('tv-c-008', 'Walter White', 'character', 'medium', {
      context: 'Breaking Bad',
      imageSearch: 'walter white breaking bad',
    }),
    card('tv-c-009', 'Tyrion Lannister', 'character', 'medium', {
      context: 'Game of Thrones',
      imageSearch: 'tyrion lannister',
    }),
    card('tv-c-010', 'The Mandalorian', 'character', 'medium', {
      context: 'The Mandalorian',
      imageSearch: 'the mandalorian grogu',
    }),
    card('tv-c-011', 'Leslie Knope', 'character', 'medium', {
      context: 'Parks and Recreation',
      imageSearch: 'leslie knope',
    }),
    card('tv-c-012', 'Dwight Schrute', 'character', 'medium', {
      context: 'The Office',
      imageSearch: 'dwight schrute',
    }),
    card('tv-c-013', 'Tony Soprano', 'character', 'hard', {
      context: 'The Sopranos',
      imageSearch: 'tony soprano',
    }),
    card('tv-c-014', 'Don Draper', 'character', 'hard', {
      context: 'Mad Men',
      imageSearch: 'don draper',
    }),
    card('tv-c-015', 'Omar Little', 'character', 'hard', {
      context: 'The Wire',
      imageSearch: 'omar little the wire',
    }),
    card('tv-c-016', 'Dale Cooper', 'character', 'hard', {
      context: 'Twin Peaks',
      imageSearch: 'agent cooper twin peaks',
    }),
    card('tv-c-017', 'Lucille Bluth', 'character', 'hard', {
      context: 'Arrested Development',
      imageSearch: 'lucille bluth',
    }),
    card('tv-c-018', 'Stringer Bell', 'character', 'hard', {
      context: 'The Wire',
      imageSearch: 'stringer bell',
    }),

    card('tv-q-001', 'How you doin?', 'quote', 'easy', {
      context: 'Friends',
      imageSearch: 'joey friends how you doin',
    }),
    card('tv-q-002', "That's what she said", 'quote', 'easy', {
      context: 'The Office',
      imageSearch: 'michael scott thats what she said',
    }),
    card('tv-q-003', 'Bears. Beets. Battlestar Galactica.', 'quote', 'easy', {
      context: 'The Office',
      imageSearch: 'dwight schrute bears beets',
    }),
    card('tv-q-004', 'Winter is coming', 'quote', 'easy', {
      context: 'Game of Thrones',
      imageSearch: 'game of thrones winter is coming',
    }),
    card('tv-q-005', 'Bazinga', 'quote', 'easy', {
      context: 'The Big Bang Theory',
      imageSearch: 'sheldon bazinga',
    }),
    card('tv-q-006', 'This is the way', 'quote', 'easy', {
      context: 'The Mandalorian',
      imageSearch: 'mandalorian this is the way',
    }),
    card('tv-q-007', 'I am the one who knocks', 'quote', 'medium', {
      context: 'Breaking Bad',
      imageSearch: 'walter white i am the one who knocks',
    }),
    card('tv-q-008', 'Pivot!', 'quote', 'medium', {
      context: 'Friends',
      imageSearch: 'friends pivot couch',
    }),
    card('tv-q-009', 'Treat yo self', 'quote', 'medium', {
      context: 'Parks and Recreation',
      imageSearch: 'treat yo self parks and rec',
    }),
    card('tv-q-010', 'I declare bankruptcy', 'quote', 'medium', {
      context: 'The Office',
      imageSearch: 'michael scott bankruptcy',
    }),
    card('tv-q-011', 'The north remembers', 'quote', 'medium', {
      context: 'Game of Thrones',
      imageSearch: 'game of thrones',
    }),
    card('tv-q-012', 'No soup for you', 'quote', 'medium', {
      context: 'Seinfeld',
      imageSearch: 'seinfeld soup nazi',
    }),
    card('tv-q-013', 'I am not a crook', 'quote', 'hard', {
      context: 'Richard Nixon',
      imageSearch: 'nixon not a crook',
    }),
    card('tv-q-014', 'The truth is out there', 'quote', 'hard', {
      context: 'The X-Files',
      imageSearch: 'x-files truth is out there',
    }),
    card('tv-q-015', 'Live long and prosper', 'quote', 'hard', {
      context: 'Star Trek',
      imageSearch: 'spock live long prosper',
    }),
    card('tv-q-016', 'Darmok and Jalad at Tanagra', 'quote', 'hard', {
      context: 'Star Trek: The Next Generation',
      imageSearch: 'star trek darmok',
    }),
    card('tv-q-017', 'I have a cunning plan', 'quote', 'hard', {
      context: 'Blackadder',
      imageSearch: 'blackadder cunning plan',
    }),
    card('tv-q-018', 'Smelly cat', 'quote', 'hard', {
      context: 'Friends',
      imageSearch: 'phoebe smelly cat',
    }),
  ],
};
