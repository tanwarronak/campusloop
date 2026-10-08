import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { getMe, getUserById, patchMe } from '../controllers/user.controller.js';
import { updateUserSchema, userIdSchema } from '../validation/user.validation.js';

const router = Router();
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, validate(updateUserSchema), patchMe);
router.get('/:id', validate(userIdSchema), getUserById);

export default router;