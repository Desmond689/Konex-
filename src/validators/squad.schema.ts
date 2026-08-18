import { z } from 'zod';

export const createSquadSchema = z.object({
  name: z.string().min(2).max(40),
  tag: z.string().min(2).max(6).optional(),
  description: z.string().max(500).optional(),
  gameId: z.string().optional(),
  isPublic: z.boolean().default(true),
});

export type CreateSquadInput = z.infer<typeof createSquadSchema>;
