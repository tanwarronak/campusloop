import { z } from 'zod';

export const updateUserSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    college: z.string().trim().max(160).optional(),
    avatar: z.string().url().or(z.literal('')).optional()
  }).strict()
};

export const userIdSchema = {
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user identifier') })
};