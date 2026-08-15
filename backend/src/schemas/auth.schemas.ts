import { z } from 'zod';

// ──────────────────────────────────────────────────────────────────────────────
// Diner Auth Schemas
// ──────────────────────────────────────────────────────────────────────────────

/**
 * POST /auth/register
 * FR-1.2 / FR-1.3: email+password, password ≥ 8 chars
 */
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
  phone: z.string().trim().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * POST /auth/login
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Staff Auth Schemas
// ──────────────────────────────────────────────────────────────────────────────

/**
 * POST /auth/staff/register
 */
export const staffRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
  role: z.enum(['owner', 'manager', 'host']),
});

export type StaffRegisterInput = z.infer<typeof staffRegisterSchema>;

/**
 * POST /auth/staff/login — same shape as diner login
 */
export const staffLoginSchema = loginSchema;
export type StaffLoginInput = LoginInput;

// ──────────────────────────────────────────────────────────────────────────────
// Token Refresh Schema
// ──────────────────────────────────────────────────────────────────────────────

/**
 * POST /auth/refresh — refreshToken may come from body or httpOnly cookie.
 * Body variant (cookie is handled separately in the controller).
 */
export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required').optional(),
});

export type RefreshInput = z.infer<typeof refreshSchema>;
