import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid conversation identifier');

export const createConversationSchema = {
  body: z.object({ listingId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid listing identifier') }).strict()
};

export const conversationIdSchema = { params: z.object({ id: objectId }) };

export const messageSchema = {
  params: z.object({ id: objectId }),
  body: z.object({ text: z.string().trim().min(1).max(2000) }).strict()
};