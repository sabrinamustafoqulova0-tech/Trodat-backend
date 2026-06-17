// ===========================================
// Admin Routes (Protected)
// ===========================================

import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Apply admin protection to all routes
router.use(authenticate, requireAdmin);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: Get all registered users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', asyncHandler(adminController.getUsers));

/**
 * @openapi
 * /admin/orders:
 *   get:
 *     summary: Get all orders from all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/orders', asyncHandler(adminController.getOrders));

export default router;
