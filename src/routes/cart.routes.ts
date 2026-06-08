// ===========================================
// Cart Routes (Protected)
// ===========================================

import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { addToCartSchema, updateCartItemSchema } from '../validators/cart.validator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User cart
 */
// GET /api/v1/cart
router.get('/', asyncHandler(cartController.getCart));

/**
 * @openapi
 * /cart/items:
 *   post:
 *     summary: Add an item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stamp_id, quantity]
 *             properties:
 *               stamp_id:
 *                 type: string
 *               quantity:
 *                 type: number
 *               color:
 *                 type: string
 *               ink_color:
 *                 type: string
 *               custom_text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item added to cart
 */
// POST /api/v1/cart/items
router.post('/items', validate(addToCartSchema), asyncHandler(cartController.addToCart));

/**
 * @openapi
 * /cart/items/{id}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
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
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cart item updated
 */
// PUT /api/v1/cart/items/:id
router.put('/items/:id', validate(updateCartItemSchema), asyncHandler(cartController.updateCartItem));

/**
 * @openapi
 * /cart/items/{id}:
 *   delete:
 *     summary: Remove an item from cart
 *     tags: [Cart]
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
 *         description: Item removed successfully
 */
// DELETE /api/v1/cart/items/:id
router.delete('/items/:id', asyncHandler(cartController.removeCartItem));

export default router;
