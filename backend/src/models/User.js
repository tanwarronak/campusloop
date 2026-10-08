import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatar: { type: String, default: '' },
    college: { type: String, default: '', trim: true },
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalTransactions: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

userSchema.index({ verified: 1 });

export const User = mongoose.model('User', userSchema);