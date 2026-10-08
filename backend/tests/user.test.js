import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Trust profile API foundation', () => {
  it('requires authentication to access the current profile', async () => {
    const res = await request(app).get('/api/users/me');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ success: false, message: 'Authentication required.' });
  });

  it('rejects malformed public profile identifiers', async () => {
    const res = await request(app).get('/api/users/not-an-id');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Validation failed' });
  });
});