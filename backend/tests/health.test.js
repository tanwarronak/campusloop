import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Health Check & App Routing Tests', () => {
  it('GET /api/health should return 200 with expected schema', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'CampusLoop API is running');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('database');
    expect(res.body.data).toHaveProperty('environment');
    expect(res.body.data).toHaveProperty('timestamp');
  });

  it('GET / should return 200 welcome message', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.message).toContain('CampusLoop API Server');
  });

  it('GET /api/non-existent-route should return standardized 404 error envelope', async () => {
    const res = await request(app).get('/api/non-existent-route');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Route not found');
  });
});
