import { z } from 'zod';

const id = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid offer identifier');
const amount = z.coerce.number().positive().finite();

export const createOfferSchema = {
  body: z.object({ conversationId: id, amount }).strict()
};

export const offerActionSchema = {
  params: z.object({ id })
};

export const counterOfferSchema = {
  params: z.object({ id }),
  body: z.object({ amount }).strict()
};