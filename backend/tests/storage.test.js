import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Azure storage API foundation', () => {
  it('rejects unsupported image types on the public upload URL endpoint', async () => {
    const res = await request(app).post('/api/storage/upload-url').send({
      contentType: 'application/pdf',
      size: 1000
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Only JPEG, PNG, and WebP images are allowed.' });
  });
});