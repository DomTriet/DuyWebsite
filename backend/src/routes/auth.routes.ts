import { Router } from 'express';
import { register, login, logout, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();

// Public access (rate-limited để chống brute-force)
router.post('/register',       authRateLimiter, register);
router.post('/login',          authRateLimiter, login);
router.post('/forgot-password', authRateLimiter, forgotPassword);

// Require Authentication
router.post('/logout', verifyToken, logout);

// Cần Token (Được cấp trong URL khi user click vào link email reset password)
router.post('/reset-password', verifyToken, resetPassword);

export default router;