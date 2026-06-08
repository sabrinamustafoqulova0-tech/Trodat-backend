// ===========================================
// Global Error Handler Middleware
// ===========================================

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors,
    });
    return;
  }

  // Custom API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Prisma known errors
  if ((err as any).code === 'P2002') {
    res.status(409).json({
      status: 'error',
      message: 'A record with this value already exists',
    });
    return;
  }

  if ((err as any).code === 'P2025') {
    res.status(404).json({
      status: 'error',
      message: 'Record not found',
    });
    return;
  }

  // Unknown errors
  console.error('❌ Unhandled Error:', err);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
};
