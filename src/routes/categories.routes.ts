// ===========================================
// Categories Routes
// ===========================================

import { Router } from 'express';
import * as categoriesController from '../controllers/categories.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
// GET /api/v1/categories
router.get('/', asyncHandler(categoriesController.getCategories));

/**
 * @openapi
 * /categories/{slug}/stamps:
 *   get:
 *     summary: Get stamps by category slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of stamps in category
 */
// GET /api/v1/categories/:slug/stamps
router.get('/:slug/stamps', asyncHandler(categoriesController.getStampsByCategory));

export default router;
