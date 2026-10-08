import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { patchAccept, patchCounter, patchReject, postOffer } from '../controllers/offer.controller.js';
import { counterOfferSchema, createOfferSchema, offerActionSchema } from '../validation/offer.validation.js';

const router = Router();
router.use(requireAuth);
router.post('/', validate(createOfferSchema), postOffer);
router.patch('/:id/counter', validate(counterOfferSchema), patchCounter);
router.patch('/:id/accept', validate(offerActionSchema), patchAccept);
router.patch('/:id/reject', validate(offerActionSchema), patchReject);

export default router;