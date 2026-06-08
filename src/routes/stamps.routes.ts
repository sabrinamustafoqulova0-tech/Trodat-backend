// ===========================================
// Stamps Routes
// ===========================================

import { Router } from 'express';
import * as stampsController from '../controllers/stamps.controller';
import { asyncHandler } from '../utils/asyncHandler';

import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /stamps/search:
 *   get:
 *     summary: Search stamps
 *     tags: [Stamps]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
// GET /api/v1/stamps/search?q=...
router.get('/search', asyncHandler(stampsController.searchStamps));

/**
 * @openapi
 * /stamps/series/{series}:
 *   get:
 *     summary: Get stamps by series
 *     tags: [Stamps]
 *     parameters:
 *       - in: path
 *         name: series
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stamps matching series
 */
// GET /api/v1/stamps/series/:series
router.get('/series/:series', asyncHandler(stampsController.getStampsBySeries));

/**
 * @openapi
 * /stamps/{id}/ink-pads:
 *   get:
 *     summary: Get ink pads for a specific stamp
 *     tags: [Stamps]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of compatible ink pads
 */
// GET /api/v1/stamps/:id/ink-pads
router.get('/:id/ink-pads', asyncHandler(stampsController.getInkPads));

/**
 * @openapi
 * /stamps/{id}:
 *   get:
 *     summary: Get a stamp by ID or Article
 *     tags: [Stamps]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stamp details
 */
// GET /api/v1/stamps/:id
router.get('/:id', asyncHandler(stampsController.getStamp));

/**
 * @openapi
 * /stamps:
 *   get:
 *     summary: Get paginated and filtered list of stamps
 *     tags: [Stamps]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated stamps
 */
// GET /api/v1/stamps
router.get('/', asyncHandler(stampsController.getStamps));

/**
 * @openapi
 * /stamps:
 *   post:
 *     summary: Create a new stamp
 *     tags: [Stamps]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, article, price]
 *     responses:
 *       201:
 *         description: Stamp created
 */
// POST /api/v1/stamps
router.post('/', asyncHandler(stampsController.createStamp));

/**
 * @openapi
 * /stamps/{id}:
 *   put:
 *     summary: Update a stamp
 *     tags: [Stamps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Stamp updated
 */
// PUT /api/v1/stamps/:id
router.put('/:id', asyncHandler(stampsController.updateStamp));

/**
 * @openapi
 * /stamps/{id}:
 *   delete:
 *     summary: Delete a stamp
 *     tags: [Stamps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Stamp deleted
 */
// DELETE /api/v1/stamps/:id
router.delete('/:id', asyncHandler(stampsController.deleteStamp));

export default router;
