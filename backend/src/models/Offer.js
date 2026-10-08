import mongoose from 'mongoose';

export const OFFER_STATUSES = ['PENDING', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'CANCELLED'];

const offerSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: OFFER_STATUSES, default: 'PENDING' },
    parentOfferId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', default: null }
  },
  { timestamps: true }
);

offerSchema.index({ listingId: 1, conversationId: 1, createdAt: -1 });
offerSchema.index({ status: 1 });

export const Offer = mongoose.model('Offer', offerSchema);