/**
 * Properties API Tests
 */
import request from 'supertest';
import express from 'express';

const mockSupabase = {
  auth: { getUser: jest.fn() },
  from: jest.fn(),
};
jest.mock('../config/supabase', () => ({ supabase: mockSupabase }));

import cors from 'cors';
import { errorHandler } from '../middlewares/error.middleware';
import propertyRouter from '../routes/property.routes';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/properties', propertyRouter);
app.use(errorHandler);

const mockListChain = (data: any[], count = 0) => ({
  select:  jest.fn().mockReturnThis(),
  eq:      jest.fn().mockReturnThis(),
  neq:     jest.fn().mockReturnThis(),
  order:   jest.fn().mockReturnThis(),
  range:   jest.fn().mockResolvedValue({ data, error: null, count }),
  ilike:   jest.fn().mockReturnThis(),
  limit:   jest.fn().mockResolvedValue({ data, error: null }),
  single:  jest.fn().mockResolvedValue({ data: data[0] || null, error: null }),
  filter:  jest.fn().mockReturnThis(),
  is:      jest.fn().mockReturnThis(),
  gte:     jest.fn().mockReturnThis(),
  lte:     jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
});

// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/properties (public)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.from.mockReturnValue(mockListChain([
      { id: 'p1', title: 'Căn hộ A', price: 2000000000, slug: 'can-ho-a', status: 'available' },
    ], 1));
  });

  it('trả về 200 + mảng properties', async () => {
    const res = await request(app).get('/api/properties');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('hỗ trợ filter theo status', async () => {
    const res = await request(app).get('/api/properties?status=available');
    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/properties/suggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.from.mockReturnValue(mockListChain([
      { id: 'p1', title: 'Căn hộ test', slug: 'can-ho-test' }
    ]));
  });

  it('trả về 200 khi có query param q', async () => {
    const res = await request(app).get('/api/properties/suggestions?q=test');
    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/properties (cần auth)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('trả về 401 nếu không có Authorization header', async () => {
    const res = await request(app).post('/api/properties').send({ title: 'Test', price: 1000 });
    expect(res.status).toBe(401);
  });

  it('trả về 401 nếu token không hợp lệ', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null }, error: { message: 'Invalid token' }
    });
    const res = await request(app)
      .post('/api/properties')
      .set('Authorization', 'Bearer invalid-token')
      .send({ title: 'Test', price: 1000 });
    expect(res.status).toBe(401);
  });
});
