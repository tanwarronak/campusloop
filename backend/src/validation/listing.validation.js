import { z } from 'zod';
import { LISTING_CATEGORIES, LISTING_CONDITIONS } from '../models/Listing.js';

const listingFields = {
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  price: z.coerce.number().positive(),
  category: z.enum(LISTING_CATEGORIES),
  condition: z.enum(LISTING_CONDITIONS),
  images: z.array(z.string().url()).max(6).default([]),
  location: z.string().trim().min(2).max(160)
};

const optionalQueryString = (schema) => z.preprocess((value) => value === '' ? undefined : value, schema.optional());

export const createListingSchema = { body: z.object(listingFields).strict() };

export const updateListingSchema = {
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid listing identifier') }),
  body: z.object(listingFields).partial().strict().refine((body) => Object.keys(body).length > 0, {
    message: 'At least one listing field is required'
  })
};

export const listingIdSchema = {
  params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid listing identifier') })
};

export const listListingsSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(12),
    search: optionalQueryString(z.string().trim().max(100)),
    category: optionalQueryString(z.enum(LISTING_CATEGORIES)),
    condition: optionalQueryString(z.enum(LISTING_CONDITIONS)),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    sort: z.enum(['newest', 'oldest', 'priceAsc', 'priceDesc']).default('newest')
  }).refine(({ minPrice, maxPrice }) => minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice, {
    message: 'Minimum price cannot exceed maximum price',
    path: ['minPrice']
  })
};