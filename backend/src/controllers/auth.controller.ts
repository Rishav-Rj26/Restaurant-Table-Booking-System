import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuthRequest, ApiResponse } from '../types/index.js';

export const registerUser = async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);
  const response: ApiResponse = {
    success: true,
    data: result,
  };
  res.status(201).json(response);
};

export const loginUser = async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  const response: ApiResponse = {
    success: true,
    data: result,
  };
  res.json(response);
};

export const registerStaff = async (req: Request, res: Response) => {
  const result = await AuthService.registerStaff(req.body);
  const response: ApiResponse = {
    success: true,
    data: result,
  };
  res.status(201).json(response);
};

export const loginStaff = async (req: Request, res: Response) => {
  const result = await AuthService.loginStaff(req.body);
  const response: ApiResponse = {
    success: true,
    data: result,
  };
  res.json(response);
};

export const refreshToken = async (req: Request, res: Response) => {
  const result = AuthService.refreshToken(req.body.token);
  const response: ApiResponse = {
    success: true,
    data: result,
  };
  res.json(response);
};

export const logout = async (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: { message: 'Logged out successfully' },
  };
  res.json(response);
};
