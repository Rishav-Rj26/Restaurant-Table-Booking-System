import { Request, Response, NextFunction } from 'express';
import * as paymentService from '../services/payment.service.js';
import { AuthRequest } from '../types/index.js';

export const createPaymentIntent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { holdId } = req.body;
    const userId = req.user!.id;
    
    if (!holdId) {
      return res.status(400).json({ success: false, error: { code: 'bad_request', message: 'Missing holdId' } });
    }

    const result = await paymentService.createPaymentIntent(holdId, userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    
    // Express raw body parser makes req.body a Buffer for this route
    await paymentService.handleWebhook(req.body, signature);
    
    res.status(200).send({ received: true });
  } catch (error) {
    // Stripe webhooks should return 400 for bad signatures
    next(error);
  }
};
