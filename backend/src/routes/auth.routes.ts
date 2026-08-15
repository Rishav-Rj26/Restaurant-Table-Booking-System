import { Router } from 'express';
import {
  registerUser,
  loginUser,
  registerStaff,
  loginStaff,
  refreshToken,
  logout,
} from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  registerSchema,
  loginSchema,
  staffRegisterSchema,
  staffLoginSchema,
  refreshTokenSchema,
} from '../validators/auth.validator.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.use(authLimiter);

router.post('/register', validate(registerSchema), asyncHandler(registerUser));
router.post('/login', validate(loginSchema), asyncHandler(loginUser));
router.post('/refresh', validate(refreshTokenSchema), asyncHandler(refreshToken));
router.post('/logout', authenticate, asyncHandler(logout));

router.post('/staff/register', validate(staffRegisterSchema), asyncHandler(registerStaff));
router.post('/staff/login', validate(staffLoginSchema), asyncHandler(loginStaff));

export { router as authRoutes };
