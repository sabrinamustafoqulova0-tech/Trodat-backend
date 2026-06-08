// ===========================================
// Orders Routes (Protected)
// ===========================================

import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrderSchema } from '../validators/orders.validator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// All order routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Get all orders for current user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
// GET /api/v1/orders
router.get('/', asyncHandler(ordersController.getOrders));

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Get a specific order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
// GET /api/v1/orders/:id
router.get('/:id', asyncHandler(ordersController.getOrder));

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Create a new order from current cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [delivery_address, payment_method]
 *             properties:
 *               delivery_address:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                   street:
 *                     type: string
 *                   zip:
 *                     type: string
 *               payment_method:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 */
// POST /api/v1/orders
router.post('/', validate(createOrderSchema), asyncHandler(ordersController.createOrder));

export default router;
