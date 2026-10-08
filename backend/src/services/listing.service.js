import { Listing } from '../models/Listing.js';
import { AppError } from '../utils/AppError.js';

const listingWithSeller = (query) => query.populate('sellerId', 'name avatar verified rating totalTransactions createdAt');

export const createListing = (sellerId, data) => Listing.create({ ...data, sellerId });

export const listListings = async (filters) => {
  const { page, limit, search, category, condition, minPrice, maxPrice, sort } = filters;
  const query = { status: { $in: ['ACTIVE', 'NEGOTIATING'] } };

  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (condition) query.condition = condition;
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    priceAsc: { price: 1 },
    priceDesc: { price: -1 }
  };
  const [items, total] = await Promise.all([
    listingWithSeller(Listing.find(query).sort(sortMap[sort]).skip((page - 1) * limit).limit(limit)),
    Listing.countDocuments(query)
  ]);

  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const getListing = async (id) => {
  const listing = await listingWithSeller(Listing.findById(id));
  if (!listing) throw new AppError('Listing not found.', 404, 'LISTING_NOT_FOUND');
  return listing;
};

const getOwnedListing = async (id, sellerId) => {
  const listing = await Listing.findOne({ _id: id, sellerId });
  if (!listing) throw new AppError('Listing not found or access denied.', 404, 'LISTING_NOT_FOUND');
  return listing;
};

export const updateListing = async (id, sellerId, data) => {
  const listing = await getOwnedListing(id, sellerId);
  if (listing.status === 'SOLD') throw new AppError('Sold listings cannot be edited.', 409, 'LISTING_SOLD');
  Object.assign(listing, data);
  await listing.save();
  return listing;
};

export const deleteListing = async (id, sellerId) => {
  const listing = await getOwnedListing(id, sellerId);
  if (listing.status === 'SOLD') throw new AppError('Sold listings cannot be deleted.', 409, 'LISTING_SOLD');
  await listing.deleteOne();
};

export const markListingSold = async (id, sellerId) => {
  const listing = await getOwnedListing(id, sellerId);
  if (listing.status === 'SOLD') throw new AppError('Listing is already sold.', 409, 'LISTING_ALREADY_SOLD');
  listing.status = 'SOLD';
  await listing.save();
  return listing;
};