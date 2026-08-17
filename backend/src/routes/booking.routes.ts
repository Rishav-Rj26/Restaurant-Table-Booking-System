import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createHoldSchema, bookingIdParamSchema, bookingListQuerySchema } from '../validators/booking.validator.js';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

router.post('/hold', validate({ body: createHoldSchema }), bookingController.createHold as any);
router.get('/me', validate({ query: bookingListQuerySchema }), bookingController.getUserBookings as any);
router.get('/:id', validate({ params: bookingIdParamSchema }), bookingController.getBooking as any);
router.post('/:id/cancel', validate({ params: bookingIdParamSchema }), bookingController.cancelBooking as any);

export { router as bookingRoutes };
