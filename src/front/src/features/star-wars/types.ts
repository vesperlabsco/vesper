import type { z } from 'zod';
import type { starWarsPersonSchema } from './schemas';

export type StarWarsPerson = z.infer<typeof starWarsPersonSchema>;
