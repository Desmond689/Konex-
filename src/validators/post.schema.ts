import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string().min(1).max(2000),
  communityId: z.string().uuid().optional(),
  mediaUrls: z.array(z.string().url()).max(4).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
