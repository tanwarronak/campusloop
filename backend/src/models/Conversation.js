import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

conversationSchema.index({ listingId: 1, buyerId: 1 }, { unique: true });
conversationSchema.index({ sellerId: 1, lastMessageAt: -1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);