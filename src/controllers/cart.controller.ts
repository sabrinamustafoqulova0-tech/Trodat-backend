// ===========================================
// Cart Controller
// ===========================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import type { AddToCartInput, UpdateCartItemInput } from '../validators/cart.validator';

/**
 * Helper to get or create a cart for the user
 */
async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { stamp: { include: { category: true } } },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: { stamp: { include: { category: true } } },
        },
      },
    });
  }

  return cart;
}

/**
 * Format cart response to match frontend expectations
 */
function formatCartResponse(cart: any) {
  const items = cart.items.map((item: any) => ({
    id: item.id,
    stamp: {
      id: item.stamp.id,
      article: item.stamp.article,
      name: item.stamp.name,
      series: item.stamp.series,
      category_id: item.stamp.category?.slug || item.stamp.categoryId,
      price: item.stamp.price,
      size: item.stamp.size,
      shape: item.stamp.shape,
      images: {
        main: item.stamp.imageMain || '',
        gallery: item.stamp.imageGallery || [],
        impression: item.stamp.imageImpression || '',
      },
      ink_pad: item.stamp.inkPad,
      features: {
        mci: item.stamp.featureMci,
        eco: item.stamp.featureEco,
        positioning: item.stamp.featurePositioning,
      },
      colors: item.stamp.colors,
      ink_colors: item.stamp.inkColors,
      description: item.stamp.description,
      in_stock: item.stamp.inStock,
      created_at: item.stamp.createdAt.toISOString(),
      max_lines: item.stamp.maxLines,
    },
    quantity: item.quantity,
    color: item.color,
    ink_color: item.inkColor,
    custom_text: item.customText,
  }));

  const total = items.reduce(
    (sum: number, item: any) => sum + item.stamp.price * item.quantity,
    0
  );

  return {
    items,
    total,
    count: items.length,
  };
}

/**
 * GET /api/v1/cart
 */
export const getCart = async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.userId);
  res.json(formatCartResponse(cart));
};

/**
 * POST /api/v1/cart/items
 */
export const addToCart = async (req: Request, res: Response) => {
  const { stamp_id, quantity, color, ink_color, custom_text } = req.body as AddToCartInput;
  const userId = req.user!.userId;

  // Verify stamp exists
  const stamp = await prisma.stamp.findUnique({ where: { id: stamp_id } });
  if (!stamp) {
    throw ApiError.notFound('Stamp not found');
  }

  // Get or create cart
  let cart = await getOrCreateCart(userId);

  // Check if item already exists in cart (same stamp + color + ink_color)
  const existingItem = cart.items.find(
    (item: any) =>
      item.stampId === stamp_id &&
      item.color === color &&
      item.inkColor === ink_color
  );

  if (existingItem) {
    // Update quantity
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    // Add new item
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        stampId: stamp_id,
        quantity,
        color,
        inkColor: ink_color,
        customText: custom_text,
      },
    });
  }

  // Fetch updated cart
  cart = await getOrCreateCart(userId);
  res.status(201).json(formatCartResponse(cart));
};

/**
 * PUT /api/v1/cart/items/:id
 */
export const updateCartItem = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { quantity } = req.body as UpdateCartItemInput;
  const userId = req.user!.userId;

  // Verify item belongs to user's cart
  const item = await prisma.cartItem.findFirst({
    where: { id, cart: { userId } },
  });

  if (!item) {
    throw ApiError.notFound('Cart item not found');
  }

  await prisma.cartItem.update({
    where: { id },
    data: { quantity },
  });

  const cart = await getOrCreateCart(userId);
  res.json(formatCartResponse(cart));
};

/**
 * DELETE /api/v1/cart/items/:id
 */
export const removeCartItem = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.userId;

  // Verify item belongs to user's cart
  const item = await prisma.cartItem.findFirst({
    where: { id, cart: { userId } },
  });

  if (!item) {
    throw ApiError.notFound('Cart item not found');
  }

  await prisma.cartItem.delete({ where: { id } });

  res.status(204).send();
};
