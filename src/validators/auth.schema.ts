import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8).regex(/[a-zA-Z]/, 'Must contain a letter').regex(/[0-9]/, 'Must contain a number'),
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscore'),
  gamerTag: z.string().min(2).max(32).optional(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
