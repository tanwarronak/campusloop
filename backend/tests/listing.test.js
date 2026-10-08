import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { listListingsSchema } from '../src/validation/listing.validation.js';

describe('Listing API foundation', () => {
  it('requires authentication to create a listing', async () => {
    const res = await request(app).post('/api/listings').send({
      title: 'Scientific calculator',
      description: 'A working calculator for engineering classes.',
      price: 800,
      category: 'CALCULATORS',
      condition: 'GOOD',
      location: 'Hostel 4'
    });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ success: false, message: 'Authentication required.' });
  });

  it('rejects malformed listing identifiers before database access', async () => {
    const res = await request(app).get('/api/listings/not-an-object-id');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Validation failed' });
  });

  it('rejects invalid listing filters', async () => {
    const res = await request(app).get('/api/listings?category=INVALID');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Validation failed' });
  });

  it('normalizes empty optional filters as omitted', () => {
    const parsed = listListingsSchema.query.parse({
      search: '',
      category: '',
      condition: '',
      page: '1',
      limit: '12'
    });

    expect(parsed.search).toBeUndefined();
    expect(parsed.category).toBeUndefined();
    expect(parsed.condition).toBeUndefined();
  });
});