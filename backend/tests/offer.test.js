import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Offer API foundation', () => {
  it('requires authentication to create an offer', async () => {
    const res = await request(app).post('/api/offers').send({
      conversationId: '507f1f77bcf86cd799439011',
      amount: 700
    });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ success: false, message: 'Authentication required.' });
  });

  it('requires authentication for offer acceptance', async () => {
    const res = await request(app).patch('/api/offers/507f1f77bcf86cd799439011/accept');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ success: false, message: 'Authentication required.' });
  });
});