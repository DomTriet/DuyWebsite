/**
 * Middleware Tests — verifyToken, requireAdmin, requireAgentOrAdmin
 */
import request from 'supertest';
import express, { Request, Response } from 'express';

const mockSupabase = {
  auth: { getUser: jest.fn() },
  from: jest.fn(),
};
jest.mock('../config/supabase', () => ({ supabase: mockSupabase }));

import { verifyToken } from '../middlewares/auth.middleware';
import { requireAdmin, requireAgentOrAdmin } from '../middlewares/role.middleware';

const mockProfileChain = (profile: any) => ({
  select: jest.fn().mockReturnThis(),
  eq:     jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: profile, error: null }),
});

// ─────────────────────────────────────────────────────────────────────────────

describe('verifyToken middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('trả về 401 nếu không có Authorization header', async () => {
    const app = express();
    app.use(express.json());
    app.get('/protected', verifyToken, (_req: Request, res: Response) => res.json({ ok: true }));

    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
  });

  it('trả về 401 nếu token hết hạn', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'JWT expired' } });

    const app = express();
    app.use(express.json());
    app.get('/protected', verifyToken, (_req: Request, res: Response) => res.json({ ok: true }));

    const res = await request(app).get('/protected').set('Authorization', 'Bearer expired-token');
    expect(res.status).toBe(401);
  });

  it('cho phép đi qua nếu token hợp lệ và profile tồn tại', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'uid-1', email: 'u@t.com' } }, error: null });
    mockSupabase.from.mockReturnValue(mockProfileChain({ id: 'uid-1', role: 'member', full_name: 'User' }));

    const app = express();
    app.use(express.json());
    app.get('/protected', verifyToken, (_req: Request, res: Response) => res.json({ ok: true }));

    const res = await request(app).get('/protected').set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('requireAdmin middleware', () => {
  it('trả về 403 nếu user là agent', async () => {
    const app = express();
    app.use(express.json());
    app.get('/admin-only', (req: any, _res, next) => {
      req.user = { id: 'uid-2', role: 'agent' };
      next();
    }, requireAdmin, (_req, res: Response) => res.json({ ok: true }));

    const res = await request(app).get('/admin-only');
    expect(res.status).toBe(403);
  });

  it('cho phép admin đi qua', async () => {
    const app = express();
    app.use(express.json());
    app.get('/admin-only', (req: any, _res, next) => {
      req.user = { id: 'uid-1', role: 'admin' };
      next();
    }, requireAdmin, (_req, res: Response) => res.json({ ok: true }));

    const res = await request(app).get('/admin-only');
    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('requireAgentOrAdmin middleware', () => {
  it('trả về 403 nếu user là member', async () => {
    const app = express();
    app.use(express.json());
    app.get('/agent-route', (req: any, _res, next) => {
      req.user = { id: 'uid-3', role: 'member' };
      next();
    }, requireAgentOrAdmin, (_req, res: Response) => res.json({ ok: true }));

    const res = await request(app).get('/agent-route');
    expect(res.status).toBe(403);
  });

  it('cho phép agent đi qua', async () => {
    const app = express();
    app.use(express.json());
    app.get('/agent-route', (req: any, _res, next) => {
      req.user = { id: 'uid-2', role: 'agent' };
      next();
    }, requireAgentOrAdmin, (_req, res: Response) => res.json({ ok: true }));

    const res = await request(app).get('/agent-route');
    expect(res.status).toBe(200);
  });
});
