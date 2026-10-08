import { asyncHandler } from '../utils/asyncHandler.js';
import { getCurrentUser, getPublicUser, updateCurrentUser } from '../services/user.service.js';

export const getMe = asyncHandler(async (req, res) => {
  const data = await getCurrentUser(req.user.id);
  res.json({ success: true, message: 'Profile retrieved successfully', data });
});

export const patchMe = asyncHandler(async (req, res) => {
  const data = await updateCurrentUser(req.user.id, req.body);
  res.json({ success: true, message: 'Profile updated successfully', data });
});

export const getUserById = asyncHandler(async (req, res) => {
  const data = await getPublicUser(req.params.id);
  res.json({ success: true, message: 'Public profile retrieved successfully', data });
});