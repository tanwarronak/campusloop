import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { isAllowedCampusEmail } from '../src/config/campus.js';
import { isGoogleConfigured } from '../src/config/passport.js';

describe('Authentication foundation', () => {
  it('accepts valid email addresses from any domain', () => {
    expect(isAllowedCampusEmail('student@campus.edu')).toBe(true);
    expect(isAllowedCampusEmail('student@gmail.com')).toBe(true);
    expect(isAllowedCampusEmail('student@outside.example')).toBe(true);
    expect(isAllowedCampusEmail('campus.edu')).toBe(false);
    expect(isAllowedCampusEmail('student@invalid_domain')).toBe(false);
  });

  it('GET /api/auth/me rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ success: false, message: 'Authentication required.' });
  });

  it('starts OAuth when configured or reports missing configuration', async () => {
    const res = await request(app).get('/api/auth/google');

    if (isGoogleConfigured()) {
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('accounts.google.com');
    } else {
      expect(res.status).toBe(503);
      expect(res.body).toMatchObject({ success: false, message: 'Google OAuth is not configured.' });
    }
  });
});