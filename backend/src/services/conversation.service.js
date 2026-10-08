import { Conversation } from '../models/Conversation.js';
import { Listing } from '../models/Listing.js';
import { Message } from '../models/Message.js';
import { AppError } from '../utils/AppError.js';

const participantQuery = (userId) => ({ $or: [{ buyerId: userId }, { sellerId: userId }] });

export const ensureParticipant = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({ _id: conversationId, ...participantQuery(userId) });
  if (!conversation) throw new AppError('Conversation not found or access denied.', 404, 'CONVERSATION_NOT_FOUND');
  return conversation;
};

export const createOrGetConversation = async (listingId, buyerId) => {
  const listing = await Listing.findById(listingId);
  if (!listing) throw new AppError('Listing not found.', 404, 'LISTING_NOT_FOUND');
  if (listing.sellerId.toString() === buyerId.toString()) {
    throw new AppError('Sellers cannot start a conversation with themselves.', 400, 'INVALID_PARTICIPANT');
  }

  const conversation = await Conversation.findOneAndUpdate(
    { listingId, buyerId },
    { $setOnInsert: { sellerId: listing.sellerId, listingId, buyerId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return conversation.populate([
    { path: 'listingId', select: 'title price images location status' },
    { path: 'buyerId', select: 'name avatar verified' },
    { path: 'sellerId', select: 'name avatar verified' }
  ]);
};

export const listConversations = (userId) =>
  Conversation.find(participantQuery(userId))
    .sort({ lastMessageAt: -1 })
    .populate('listingId', 'title price images location status')
    .populate('buyerId', 'name avatar verified')
    .populate('sellerId', 'name avatar verified');

export const getConversation = async (conversationId, userId) => {
  const conversation = await ensureParticipant(conversationId, userId);
  return conversation.populate([
    { path: 'listingId', select: 'title price images location status' },
    { path: 'buyerId', select: 'name avatar verified' },
    { path: 'sellerId', select: 'name avatar verified' }
  ]);
};

export const getMessages = async (conversationId, userId) => {
  await ensureParticipant(conversationId, userId);
  return Message.find({ conversationId }).sort({ createdAt: 1 }).populate('senderId', 'name avatar');
};

export const sendMessage = async (conversationId, senderId, text) => {
  const conversation = await ensureParticipant(conversationId, senderId);
  const message = await Message.create({ conversationId, senderId, type: 'TEXT', text });
  conversation.lastMessage = text;
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();
  return message.populate('senderId', 'name avatar');
};