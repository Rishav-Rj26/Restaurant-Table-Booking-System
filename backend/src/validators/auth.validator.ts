import { z } from 'zod';
import { STAFF_ROLES } from '../config/constants.js';

export const registerSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone: z.string().optional(),
    preferences: z.object({
      cuisines: z.array(z.string()).optional(),
      dietary: z.array(z.string()).optional(),
    }).optional(),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
};

export const staffRegisterSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(STAFF_ROLES as unknown as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid staff role' }),
    }),
  }),
};

export const staffLoginSchema = {
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
};

export const refreshTokenSchema = {
  body: z.object({
    token: z.string().min(1, 'Refresh token is required'),
  }),
};
