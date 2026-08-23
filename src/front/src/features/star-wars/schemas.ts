import { z } from 'zod';

export const starWarsPersonSchema = z.object({
  uid: z.string(),
  name: z.string(),
  url: z.url(),
});

export const starWarsPeopleResponseSchema = z.object({
  message: z.string(),
  total_records: z.number(),
  total_pages: z.number(),
  results: z.array(starWarsPersonSchema),
});
