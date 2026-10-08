import mongoose from 'mongoose';

export const LISTING_CATEGORIES = [
  'BOOKS',
  'ELECTRONICS',
  'CALCULATORS',
  'CYCLES',
  'HOSTEL',
  'FURNITURE',
  'SPORTS',
  'ACADEMIC',
  'FASHION',
  'OTHER'
];

export const LISTING_CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];
export const LISTING_STATUSES = ['ACTIVE', 'NEGOTIATING', 'SOLD', 'ARCHIVED'];

const listingSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 1 },
    category: { type: String, required: true, enum: LISTING_CATEGORIES, index: true },
    condition: { type: String, required: true, enum: LISTING_CONDITIONS },
    images: [{ type: String, trim: true }],
    location: { type: String, required: true, trim: true, maxlength: 160 },
    status: { type: String, required: true, enum: LISTING_STATUSES, default: 'ACTIVE', index: true }
  },
  { timestamps: true }
);

listingSchema.index({ title: 'text', description: 'text' });
listingSchema.index({ createdAt: -1 });

export const Listing = mongoose.model('Listing', listingSchema);