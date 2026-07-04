import { z } from 'zod';

export const cardTypeSchema = z.enum([
  'word',
  'term',
  'quote',
  'person',
  'title',
  'character',
  'actor',
]);

export const difficultySchema = z.enum(['easy', 'medium', 'hard']);

export const generationSchema = z.enum(['gen-alpha', 'gen-z', 'millennial', 'gen-x-plus']);

export const charadesCardSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  type: cardTypeSchema,
  difficulty: difficultySchema,
  actHint: z.string().min(1).optional(),
  generations: z.array(generationSchema).min(1).optional(),
  context: z.string().min(1).optional(),
  guessHint: z.string().min(1).optional(),
  definition: z.string().min(1).optional(),
  emoji: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  imageAlt: z.string().min(1).optional(),
  giphyId: z.string().min(1).optional(),
  imageSearch: z.string().min(1).optional(),
});

export const charadesPackSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  ageMin: z.number().int().min(0),
  ageMax: z.number().int().min(0).nullable(),
  cards: z.array(charadesCardSchema).min(1),
});

export function validatePack(pack: unknown) {
  return charadesPackSchema.parse(pack);
}
