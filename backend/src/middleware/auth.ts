import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { JwtPayload } from '../types/auth.types.js';
import { createAppError } from './errorHandler.js';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createAppError(401, 'unauthorized', 'Authentication required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    if (decoded.type !== 'access') {
      return next(createAppError(401, 'invalid_token', 'Invalid token type'));
    }
    req.user = {
      id: decoded.sub,
      accountType: decoded.accountType,
      role: decoded.role,
    };
    next();
  } catch (error) {
    next(createAppError(401, 'invalid_token', 'Invalid or expired token'));
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
      if (decoded.type === 'access') {
        req.user = {
          id: decoded.sub,
          accountType: decoded.accountType,
          role: decoded.role,
        };
      }
    } catch (error) {
      // Ignored for optional auth
    }
  }
  next();
};
