import { Request, Response, NextFunction } from 'express';
import { createAppError } from './errorHandler.js';
import { Staff } from '../models/Staff.model.js';
import { StaffRole } from '../config/constants.js';

export const authorize = (...roles: (StaffRole | 'user')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createAppError(401, 'unauthorized', 'Authentication required'));
    }

    const userRole = req.user.role || req.user.accountType;
    if (!roles.includes(userRole as any)) {
      return next(createAppError(403, 'forbidden', 'You do not have permission to perform this action'));
    }

    next();
  };
};

export const requireRestaurantAccess = (paramName: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createAppError(401, 'unauthorized', 'Authentication required'));
    }

    if (req.user.accountType === 'user') {
      return next(createAppError(403, 'forbidden', 'Only staff can manage restaurants'));
    }

    try {
      const restaurantId = req.params[paramName];
      if (!restaurantId) {
        return next(createAppError(400, 'bad_request', `Missing restaurant ID param: ${paramName}`));
      }

      const staff = await Staff.findById(req.user.id);
      if (!staff) {
        return next(createAppError(401, 'unauthorized', 'Staff not found'));
      }

      const hasAccess = staff.restaurants.some((id) => id.toString() === restaurantId);
      
      if (!hasAccess) {
        return next(createAppError(403, 'forbidden', 'You do not have access to this restaurant'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
