import { AppError } from '../utils/AppError.js';

export const requireAuth = (req, _res, next) => {
  if (req.isAuthenticated?.() && req.user) return next();
  return next(new AppError('Authentication required.', 401, 'AUTH_REQUIRED'));
};