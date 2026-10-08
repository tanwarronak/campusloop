import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  getConversationById,
  getConversationMessages,
  getConversations,
  postConversation,
  postMessage
} from '../controllers/conversation.controller.js';
import { conversationIdSchema, createConversationSchema, messageSchema } from '../validation/conversation.validation.js';

const router = Router();
router.use(requireAuth);
router.post('/', validate(createConversationSchema), postConversation);
router.get('/', getConversations);
router.get('/:id', validate(conversationIdSchema), getConversationById);
router.get('/:id/messages', validate(conversationIdSchema), getConversationMessages);
router.post('/:id/messages', validate(messageSchema), postMessage);

export default router;