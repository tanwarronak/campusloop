import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  getListings,
  getListingById,
  patchListing,
  postListing,
  removeListing,
  soldListing
} from '../controllers/listing.controller.js';
import {
  createListingSchema,
  listingIdSchema,
  listListingsSchema,
  updateListingSchema
} from '../validation/listing.validation.js';

const router = Router();

router.get('/', validate(listListingsSchema), getListings);
router.post('/', requireAuth, validate(createListingSchema), postListing);
router.get('/:id', validate(listingIdSchema), getListingById);
router.patch('/:id/sold', requireAuth, validate(listingIdSchema), soldListing);
router.patch('/:id', requireAuth, validate(updateListingSchema), patchListing);
router.delete('/:id', requireAuth, validate(listingIdSchema), removeListing);

export default router;