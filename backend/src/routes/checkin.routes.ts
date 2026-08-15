import { Router } from 'express';
import * as checkinController from '../controllers/checkin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// All check-in routes require staff authentication
router.use(authenticate);

router.post('/verify', authorize('owner', 'manager', 'host'), checkinController.verifyBooking as any);
router.post('/no-show/:bookingId', authorize('owner', 'manager', 'host'), checkinController.markNoShow as any);

export { router as checkinRoutes };
