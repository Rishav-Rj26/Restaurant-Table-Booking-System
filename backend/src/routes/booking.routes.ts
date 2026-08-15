import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

router.post('/hold', bookingController.createHold as any);
router.get('/me', bookingController.getUserBookings as any);
router.get('/:id', bookingController.getBooking as any);
router.post('/:id/cancel', bookingController.cancelBooking as any);

export { router as bookingRoutes };
