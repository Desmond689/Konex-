import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(300).optional(),
  gamerTag: z.string().min(2).max(32).optional(),
  country: z.string().max(56).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
