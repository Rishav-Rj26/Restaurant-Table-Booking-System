import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

/**
 * Standard error shape per api.md §10:
 * { error: { code: string, message: string } }
 */
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function createAppError(
  statusCode: number,
  code: string,
  message: string
): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

/**
 * Wraps async route handlers so thrown errors are caught and forwarded to Express.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handler middleware — must be registered last.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'internal_error';
  const message = err.message || 'An unexpected error occurred';

  // Log full error in development
  if (env.NODE_ENV === 'development') {
    console.error('🔴 Error:', {
      statusCode,
      code,
      message,
      stack: err.stack,
    });
  } else {
    console.error(`🔴 [${code}] ${message}`);
  }

  res.status(statusCode).json({
    error: {
      code,
      message: statusCode === 500 && env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : message,
    },
  });
}
