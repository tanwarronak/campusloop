import { Router } from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { postUploadUrl } from '../controllers/storage.controller.js';
import { uploadUrlSchema } from '../validation/storage.validation.js';

const router = Router();

router.post('/upload-url', validate(uploadUrlSchema), postUploadUrl);

export default router;