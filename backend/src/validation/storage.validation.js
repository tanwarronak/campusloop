import { z } from 'zod';

export const uploadUrlSchema = {
  body: z.object({
    contentType: z.string().min(1),
    size: z.coerce.number().int().positive()
  }).strict()
};