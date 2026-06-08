// ===========================================
// Zod Validation Middleware
// ===========================================

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Validates req.body against a Zod schema.
 * Passes cleaned data forward, or throws validation errors.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};
