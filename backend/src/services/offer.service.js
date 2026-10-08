import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import { Listing } from '../models/Listing.js';
import { Message } from '../models/Message.js';
import { Offer } from '../models/Offer.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const actionable = ['PENDING', 'COUNTERED'];

const getConversationOffer = async (conversationId, buyerId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation || conversation.buyerId.toString() !== buyerId.toString()) {
    throw new AppError('Conversation not found or access denied.', 404, 'CONVERSATION_NOT_FOUND');
  }
  return conversation;
};

export const createOffer = async (buyerId, conversationId, amount) => {
  const conversation = await getConversationOffer(conversationId, buyerId);
  const listing = await Listing.findOne({ _id: conversation.listingId, status: { $in: ['ACTIVE', 'NEGOTIATING'] } });
  if (!listing) throw new AppError('This listing is no longer available.', 409, 'LISTING_UNAVAILABLE');

  const offer = await Offer.create({ listingId: listing.id, conversationId, buyerId, sellerId: conversation.sellerId, amount });
  await Listing.updateOne({ _id: listing.id, status: 'ACTIVE' }, { $set: { status: 'NEGOTIATING' } });
  await Message.create({ conversationId, senderId: buyerId, type: 'OFFER', text: `Offer: ₹${amount}` });
  return offer;
};

const getOffer = async (offerId) => {
  const offer = await Offer.findById(offerId);
  if (!offer) throw new AppError('Offer not found.', 404, 'OFFER_NOT_FOUND');
  if (!actionable.includes(offer.status)) throw new AppError('This offer is no longer actionable.', 409, 'OFFER_CLOSED');
  return offer;
};

const validateAcceptance = (offer, userId) => {
  if (!offer || !actionable.includes(offer.status)) throw new AppError('This offer is no longer actionable.', 409, 'OFFER_CLOSED');
  const isSeller = offer.sellerId.toString() === userId.toString();
  const isBuyer = offer.buyerId.toString() === userId.toString();
  if (!isSeller && !isBuyer) throw new AppError('Only participants can accept an offer.', 403, 'FORBIDDEN');
  if (isBuyer && offer.status !== 'COUNTERED') throw new AppError('A buyer can accept only a counter-offer.', 403, 'FORBIDDEN');
};

const acceptOfferWithoutTransaction = async (userId, offerId) => {
  const offer = await Offer.findById(offerId);
  validateAcceptance(offer, userId);

  const listing = await Listing.findOneAndUpdate(
    { _id: offer.listingId, status: { $in: ['ACTIVE', 'NEGOTIATING'] } },
    { $set: { status: 'SOLD' } },
    { new: true }
  );
  if (!listing) throw new AppError('Listing is already sold or unavailable.', 409, 'LISTING_UNAVAILABLE');

  const accepted = await Offer.findOneAndUpdate(
    { _id: offer.id, status: { $in: actionable } },
    { $set: { status: 'ACCEPTED' } },
    { new: true }
  );
  if (!accepted) throw new AppError('This offer is no longer actionable.', 409, 'OFFER_CLOSED');

  await Offer.updateMany(
    { listingId: offer.listingId, _id: { $ne: offer.id }, status: { $in: actionable } },
    { $set: { status: 'CANCELLED' } }
  );
  await User.updateMany({ _id: { $in: [offer.buyerId, offer.sellerId] } }, { $inc: { totalTransactions: 1 } });
  await Message.create({ conversationId: offer.conversationId, senderId: userId, type: 'OFFER_ACCEPTED', text: `Deal accepted at ₹${offer.amount}. Listing sold.` });
  return accepted;
};

const isStandaloneTransactionError = (error) =>
  error?.code === 20 || /transaction numbers are only allowed on a replica set member or mongos/i.test(error?.message || '');

export const counterOffer = async (sellerId, offerId, amount) => {
  const previous = await getOffer(offerId);
  if (previous.sellerId.toString() !== sellerId.toString()) throw new AppError('Only the seller can counter an offer.', 403, 'FORBIDDEN');

  previous.status = 'COUNTERED';
  await previous.save();
  const counter = await Offer.create({
    listingId: previous.listingId,
    conversationId: previous.conversationId,
    buyerId: previous.buyerId,
    sellerId: previous.sellerId,
    amount,
    status: 'COUNTERED',
    parentOfferId: previous.id
  });
  await Message.create({ conversationId: previous.conversationId, senderId: sellerId, type: 'COUNTER_OFFER', text: `Counter offer: ₹${amount}` });
  return counter;
};

export const rejectOffer = async (userId, offerId) => {
  const offer = await getOffer(offerId);
  if (![offer.buyerId.toString(), offer.sellerId.toString()].includes(userId.toString())) {
    throw new AppError('Only participants can reject an offer.', 403, 'FORBIDDEN');
  }
  offer.status = 'REJECTED';
  await offer.save();
  await Message.create({ conversationId: offer.conversationId, senderId: userId, type: 'OFFER_REJECTED', text: 'Offer declined' });
  return offer;
};

export const acceptOffer = async (userId, offerId) => {
  const session = await mongoose.startSession();
  let sessionEnded = false;
  try {
    let accepted;
    await session.withTransaction(async () => {
      const offer = await Offer.findById(offerId).session(session);
      validateAcceptance(offer, userId);

      const listing = await Listing.findOneAndUpdate(
        { _id: offer.listingId, status: { $in: ['ACTIVE', 'NEGOTIATING'] } },
        { $set: { status: 'SOLD' } },
        { new: true, session }
      );
      if (!listing) throw new AppError('Listing is already sold or unavailable.', 409, 'LISTING_UNAVAILABLE');

      accepted = await Offer.findOneAndUpdate({ _id: offer.id, status: { $in: actionable } }, { $set: { status: 'ACCEPTED' } }, { new: true, session });
      await Offer.updateMany({ listingId: offer.listingId, _id: { $ne: offer.id }, status: { $in: actionable } }, { $set: { status: 'CANCELLED' } }, { session });
      await User.updateMany({ _id: { $in: [offer.buyerId, offer.sellerId] } }, { $inc: { totalTransactions: 1 } }, { session });
      await Message.create([{ conversationId: offer.conversationId, senderId: userId, type: 'OFFER_ACCEPTED', text: `Deal accepted at ₹${offer.amount}. Listing sold.` }], { session });
    });
    return accepted;
  } catch (error) {
    if (!isStandaloneTransactionError(error)) throw error;
    await session.endSession();
    sessionEnded = true;
    return acceptOfferWithoutTransaction(userId, offerId);
  } finally {
    if (!sessionEnded) await session.endSession();
  }
};