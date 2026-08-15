import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service.js';

export const getOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: { code: 'bad_request', message: 'Missing "from" and/or "to" query parameters (YYYY-MM-DD)' },
      });
    }

    const overview = await analyticsService.getOverview(
      restaurantId as string,
      from as string,
      to as string
    );

    res.status(200).json({ success: true, data: overview });
  } catch (error) {
    next(error);
  }
};
