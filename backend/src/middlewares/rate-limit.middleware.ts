import rateLimit from 'express-rate-limit';

export const forumRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1,
  message: { error: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau 1 phút.', code: 429 },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter — giới hạn brute-force đăng nhập / đăng ký
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10,                   // tối đa 10 lần / 15 phút / IP
  message: { error: 'Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 15 phút.', code: 429 },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // không đếm request thành công vào quota
});