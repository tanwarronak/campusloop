import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import listingRoutes from './listing.routes.js';
import storageRoutes from './storage.routes.js';
import conversationRoutes from './conversation.routes.js';
import offerRoutes from './offer.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

// Mount Health Routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/storage', storageRoutes);
router.use('/conversations', conversationRoutes);
router.use('/offers', offerRoutes);
router.use('/users', userRoutes);

// Additional domain routers will be mounted here in future phases:
// router.use('/users', userRoutes);
// router.use('/listings', listingRoutes);
// router.use('/conversations', conversationRoutes);
// router.use('/offers', offerRoutes);

export default router;
