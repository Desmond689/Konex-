import { z } from 'zod';

export const createReportSchema = z.object({
  targetType: z.enum(['user', 'post', 'comment', 'message', 'squad']),
  targetId: z.string().min(1),
  reason: z.string().min(3).max(200),
  details: z.string().max(1000).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
