import { z } from 'zod';

export const createLFGSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  gameId: z.string().optional(),
  rank: z.string().optional(),
  slots: z.number().int().min(1).max(20),
  tags: z.array(z.string()).max(5).optional(),
});

export type CreateLFGInput = z.infer<typeof createLFGSchema>;
