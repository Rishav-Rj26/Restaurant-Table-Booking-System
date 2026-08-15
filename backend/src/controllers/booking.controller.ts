import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/booking.service.js';
import { AuthRequest } from '../types/index.js';
import { Booking } from '../models/Booking.model.js';
import { createAppError } from '../middleware/errorHandler.js';

export const createHold = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId, tableId, slotStart, partySize } = req.body;
    const userId = req.user!.id;

    if (!restaurantId || !tableId || !slotStart || !partySize) {
      return res.status(400).json({ success: false, error: { code: 'bad_request', message: 'Missing required fields' } });
    }

    const result = await bookingService.createHold(userId, restaurantId, tableId, slotStart, partySize);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { status } = req.query;
    
    const bookings = await bookingService.getUserBookings(userId, status as string);
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const booking = await Booking.findById(req.params.id as string).populate('restaurantId', 'name address photos cancellationPolicy');
    
    if (!booking) {
      throw createAppError(404, 'not_found', 'Booking not found');
    }

    // Allow user who owns it, or staff (we can do a simple staff check via accountType)
    if (booking.userId.toString() !== req.user!.id && req.user!.accountType === 'user') {
      throw createAppError(403, 'forbidden', 'Access denied');
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await bookingService.cancelBooking(req.params.id as string, req.user!.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
