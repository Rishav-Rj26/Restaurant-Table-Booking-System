import { Request, Response, NextFunction } from 'express';
import * as availabilityService from '../services/availability.service.js';

export const searchRestaurants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await availabilityService.searchRestaurants(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
