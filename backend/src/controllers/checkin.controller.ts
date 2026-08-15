import { Request, Response, NextFunction } from 'express';
import * as checkinService from '../services/checkin.service.js';
import { AuthRequest } from '../types/index.js';

export const verifyBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingCode, restaurantId } = req.body;

    if (!bookingCode || !restaurantId) {
      return res.status(400).json({
        success: false,
        error: { code: 'bad_request', message: 'Missing bookingCode or restaurantId' },
      });
    }

    const result = await checkinService.verifyBooking(bookingCode, restaurantId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const markNoShow = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: { code: 'bad_request', message: 'Missing restaurantId' },
      });
    }

    const result = await checkinService.markNoShow(bookingId as string, restaurantId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
