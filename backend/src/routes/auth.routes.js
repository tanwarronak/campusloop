import { Router } from 'express';
import {
  finishGoogleAuth,
  getCurrentUser,
  logout,
  startGoogleAuth
} from '../controllers/auth.controller.js';

const router = Router();

router.get('/me', getCurrentUser);
router.get('/google', startGoogleAuth);
router.get('/google/callback', finishGoogleAuth);
router.post('/logout', logout);

export default router;