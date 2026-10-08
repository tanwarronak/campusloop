import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import { User } from '../models/User.js';
import { isAllowedCampusEmail } from './campus.js';

let configured = false;

export const configurePassport = () => {
  if (configured || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return;

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email || !isAllowedCampusEmail(email)) {
            return done(null, false, { message: 'A verified campus email is required.' });
          }

          const user = await User.findOneAndUpdate(
            { email },
            {
              $set: {
                name: profile.displayName || email,
                avatar: profile.photos?.[0]?.value || '',
                verified: true
              },
              $setOnInsert: { email }
            },
            { new: true, upsert: true, runValidators: true }
          );
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      done(null, await User.findById(id));
    } catch (error) {
      done(error);
    }
  });
  configured = true;
};

export const isGoogleConfigured = () =>
  Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);