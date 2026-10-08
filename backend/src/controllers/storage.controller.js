import { asyncHandler } from '../utils/asyncHandler.js';
import { createImageUploadUrl } from '../services/storage.service.js';

export const postUploadUrl = asyncHandler(async (req, res) => {
  const data = createImageUploadUrl(req.body);
  res.json({ success: true, message: 'Upload URL created successfully', data });
});