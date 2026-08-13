import rateLimit from 'express-rate-limit';

/**
 * Strict rate limit for auth endpoints to prevent credential stuffing.
 * 20 requests per 15-minute window per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'rate_limit_exceeded',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
});

/**
 * Strict rate limit for booking-hold creation to prevent slot hoarding.
 * 10 hold attempts per 5-minute window per IP.
 */
export const bookingHoldLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'rate_limit_exceeded',
      message: 'Too many booking attempts. Please try again shortly.',
    },
  },
});

/**
 * General API rate limit — generous for normal usage.
 * 200 requests per minute per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'rate_limit_exceeded',
      message: 'Too many requests. Please slow down.',
    },
  },
});
