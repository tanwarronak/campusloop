import passport from 'passport';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { isGoogleConfigured } from '../config/passport.js';
import { env } from '../config/env.js';

export const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.isAuthenticated?.() || !req.user) {
    throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
  }

  res.json({ success: true, message: 'Current user retrieved successfully', data: req.user });
});

export const startGoogleAuth = (req, res, next) => {
  if (!isGoogleConfigured()) {
    return next(new AppError('Google OAuth is not configured.', 503, 'OAUTH_NOT_CONFIGURED'));
  }
  return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

export const finishGoogleAuth = (req, res, next) => {
  if (!isGoogleConfigured()) {
    return next(new AppError('Google OAuth is not configured.', 503, 'OAUTH_NOT_CONFIGURED'));
  }

  return passport.authenticate('google', (error, user, info) => {
    if (error) return next(error);
    if (!user) return next(new AppError(info?.message || 'Google authentication failed.', 401));

    return req.logIn(user, (loginError) => {
      if (loginError) return next(loginError);
      return res.redirect(`${env.CLIENT_URL}/`);
    });
  })(req, res, next);
};

export const logout = asyncHandler(async (req, res) => {
  await new Promise((resolve, reject) => req.logout((error) => (error ? reject(error) : resolve())));
  await new Promise((resolve, reject) => req.session.destroy((error) => (error ? reject(error) : resolve())));
  res.clearCookie('campusloop.sid');
  res.json({ success: true, message: 'Logged out successfully', data: null });
});