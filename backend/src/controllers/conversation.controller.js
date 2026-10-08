import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createOrGetConversation,
  getConversation,
  getMessages,
  listConversations,
  sendMessage
} from '../services/conversation.service.js';

export const postConversation = asyncHandler(async (req, res) => {
  const data = await createOrGetConversation(req.body.listingId, req.user.id);
  res.status(201).json({ success: true, message: 'Conversation ready', data });
});

export const getConversations = asyncHandler(async (req, res) => {
  const data = await listConversations(req.user.id);
  res.json({ success: true, message: 'Conversations retrieved successfully', data });
});

export const getConversationById = asyncHandler(async (req, res) => {
  const data = await getConversation(req.params.id, req.user.id);
  res.json({ success: true, message: 'Conversation retrieved successfully', data });
});

export const getConversationMessages = asyncHandler(async (req, res) => {
  const data = await getMessages(req.params.id, req.user.id);
  res.json({ success: true, message: 'Messages retrieved successfully', data });
});

export const postMessage = asyncHandler(async (req, res) => {
  const data = await sendMessage(req.params.id, req.user.id, req.body.text);
  req.app.get('io')?.to(`conversation:${req.params.id}`).emit('newMessage', data);
  res.status(201).json({ success: true, message: 'Message sent successfully', data });
});