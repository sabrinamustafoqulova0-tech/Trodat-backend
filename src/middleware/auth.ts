// ===========================================
// Authentication Middleware
// ===========================================

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Requires a valid JWT access token in the Authorization header.
 * Attaches decoded user payload to req.user
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Access token is required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Access token has expired'));
    }
    return next(ApiError.unauthorized('Invalid access token'));
  }
};

/**
 * Requires the authenticated user to have the ADMIN role.
 * Must be used AFTER authenticate middleware.
 */
export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
};
