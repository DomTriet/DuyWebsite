/**
 * Auth API Tests — mock supabase singleton, test logic & HTTP responses
 */
import request from 'supertest';
import express from 'express';

// ── Mock supabase singleton trước khi bất kỳ module nào import nó ─────────────
const mockSupabase = {
  auth: {
    signUp:                   jest.fn(),
    signInWithPassword:       jest.fn(),
    signOut:                  jest.fn(),
    resetPasswordForEmail:    jest.fn(),
    updateUser:               jest.fn(),
    getUser:                  jest.fn(),
  },
  from: jest.fn(),
};

jest.mock('../config/supabase', () => ({ supabase: mockSupabase }));

// ── Import sau khi mock đã được thiết lập ─────────────────────────────────────
import cors from 'cors';
import { errorHandler } from '../middlewares/error.middleware';
import authRouter from '../routes/auth.routes';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use(errorHandler);

// Helper tạo mock Supabase query chain
const mockChain = (resolveValue: any) => ({
  select:  jest.fn().mockReturnThis(),
  eq:      jest.fn().mockReturnThis(),
  single:  jest.fn().mockResolvedValue(resolveValue),
  insert:  jest.fn().mockReturnThis(),
  update:  jest.fn().mockReturnThis(),
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('trả về 400 nếu thiếu email', async () => {
    const res = await request(app).post('/api/auth/register').send({ full_name: 'Test' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('trả về 201 khi đăng ký thành công', async () => {
    mockSupabase.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: 'uid-123', email: 'new@test.com' } }, error: null,
    });
    mockSupabase.from.mockReturnValue(mockChain({ data: { id: 'uid-123', role: 'member' }, error: null }));

    const res = await request(app).post('/api/auth/register').send({
      full_name: 'Test User', email: 'new@test.com', password: 'password123'
    });
    expect(res.status).toBe(201);
  });

  it('trả về lỗi khi email đã tồn tại', async () => {
    mockSupabase.auth.signUp.mockResolvedValueOnce({
      data: null, error: { message: 'User already registered', status: 422 },
    });
    const res = await request(app).post('/api/auth/register').send({
      full_name: 'Test', email: 'existing@test.com', password: 'password123'
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('trả về 400 nếu thiếu email', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: '123456' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('trả về 200 + session khi đăng nhập thành công', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        session: { access_token: 'tok', refresh_token: 'ref', user: { id: 'uid-1', email: 'admin@test.com' } },
        user:    { id: 'uid-1', email: 'admin@test.com' },
      },
      error: null,
    });
    mockSupabase.from.mockReturnValue(mockChain({ data: { id: 'uid-1', role: 'admin', full_name: 'Admin' }, error: null }));

    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'pw123456' });
    expect(res.status).toBe(200);
    // API trả về { data: { session: {...} }, message: '...' }
    expect(res.body).toHaveProperty('data.session');
  });

  it('trả về 4xx khi sai credentials', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: null, error: { message: 'Invalid login credentials', status: 400 },
    });
    const res = await request(app).post('/api/auth/login').send({ email: 'w@t.com', password: 'wrong' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => jest.clearAllMocks());

  it('trả về 400 nếu thiếu email', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('trả về 200 khi email hợp lệ', async () => {
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ data: {}, error: null });
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'user@test.com' });
    expect(res.status).toBe(200);
  });
});
