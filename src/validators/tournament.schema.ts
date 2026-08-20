import { z } from 'zod';

export const createTournamentSchema = z.object({
  name: z.string().min(3).max(80),
  gameId: z.string().optional(),
  startAt: z.string().datetime(),
  maxTeams: z.number().int().min(2).max(128),
  prizePool: z.string().optional(),
  rules: z.string().max(5000).optional(),
});

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
