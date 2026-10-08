import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Conversation API foundation', () => {
  it('requires authentication to create a listing-bound conversation', async () => {
    const res = await request(app).post('/api/conversations').send({
      listingId: '507f1f77bcf86cd799439011'
    });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ success: false, message: 'Authentication required.' });
  });

  it('requires authentication to access message history', async () => {
    const res = await request(app).get('/api/conversations/507f1f77bcf86cd799439011/messages');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ success: false, message: 'Authentication required.' });
  });
});