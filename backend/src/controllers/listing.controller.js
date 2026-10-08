import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createListing,
  deleteListing,
  getListing,
  listListings,
  markListingSold,
  updateListing
} from '../services/listing.service.js';

export const getListings = asyncHandler(async (req, res) => {
  const data = await listListings(req.query);
  res.json({ success: true, message: 'Listings retrieved successfully', data });
});

export const getListingById = asyncHandler(async (req, res) => {
  const data = await getListing(req.params.id);
  res.json({ success: true, message: 'Listing retrieved successfully', data });
});

export const postListing = asyncHandler(async (req, res) => {
  const data = await createListing(req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Listing created successfully', data });
});

export const patchListing = asyncHandler(async (req, res) => {
  const data = await updateListing(req.params.id, req.user.id, req.body);
  res.json({ success: true, message: 'Listing updated successfully', data });
});

export const removeListing = asyncHandler(async (req, res) => {
  await deleteListing(req.params.id, req.user.id);
  res.json({ success: true, message: 'Listing deleted successfully', data: null });
});

export const soldListing = asyncHandler(async (req, res) => {
  const data = await markListingSold(req.params.id, req.user.id);
  res.json({ success: true, message: 'Listing marked as sold', data });
});