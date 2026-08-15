import { Request, Response, NextFunction } from 'express';
import * as restaurantService from '../services/restaurant.service.js';
import * as tableService from '../services/table.service.js';
import { AuthRequest } from '../types/index.js';

export const createRestaurant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ownerId = req.user!.id;
    const restaurant = await restaurantService.createRestaurant(req.body, ownerId);
    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

export const getRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurant = await restaurantService.getRestaurant(req.params.id as string);
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurant = await restaurantService.updateRestaurant(req.params.id as string, req.body);
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, date } = req.query;
    const filters = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as string,
      date: date as string
    };
    
    const result = await restaurantService.getRestaurantBookings(req.params.id as string, filters);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getTables = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tables = await tableService.getTables(req.params.id as string);
    res.status(200).json({ success: true, data: tables });
  } catch (error) {
    next(error);
  }
};

export const addTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const table = await tableService.addTable(req.params.id as string, req.body);
    res.status(201).json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

export const updateTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const table = await tableService.updateTable(req.params.id as string, req.params.tableId as string, req.body);
    res.status(200).json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

export const getAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This will be delegated to availability.service.ts in Phase 5
    // Returning a placeholder for now
    res.status(200).json({ 
      success: true, 
      data: { message: "Availability engine will be implemented in Phase 5" } 
    });
  } catch (error) {
    next(error);
  }
};
