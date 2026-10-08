import mongoose from 'mongoose';

export const MESSAGE_TYPES = ['TEXT', 'OFFER', 'COUNTER_OFFER', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'SYSTEM'];

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: MESSAGE_TYPES, default: 'TEXT' },
    text: { type: String, required: true, trim: true, maxlength: 2000 }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);