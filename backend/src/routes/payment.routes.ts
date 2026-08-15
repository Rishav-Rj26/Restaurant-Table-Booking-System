import { Router } from 'express';
import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Webhook is mounted directly in app.ts to bypass express.json()

// Protected routes
router.use(authenticate);
router.post('/intent', paymentController.createPaymentIntent as any);

export { router as paymentRoutes };
