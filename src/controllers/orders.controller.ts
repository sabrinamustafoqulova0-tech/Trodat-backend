// ===========================================
// Orders Controller
// ===========================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { notifyAdminOrder } from '../lib/telegram';
import type { CreateOrderInput } from '../validators/orders.validator';

/**
 * GET /api/v1/orders
 */
export const getOrders = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { stamp: { include: { category: true } } },
      },
    },
  });

  res.json({
    data: orders.map(formatOrder),
  });
};

/**
 * GET /api/v1/orders/:id
 */
export const getOrder = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.userId;

  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: {
      items: {
        include: { stamp: { include: { category: true } } },
      },
    },
  });

  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  res.json(formatOrder(order));
};

/**
 * POST /api/v1/orders
 * Creates an order from the user's current cart contents
 */
export const createOrder = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { delivery_address, payment_method } = req.body as CreateOrderInput;

  // Get user's cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { stamp: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Cart is empty');
  }

  // Calculate total
  const total = cart.items.reduce(
    (sum, item) => sum + item.stamp.price * item.quantity,
    0
  );

  // Create order with items in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        total,
        itemsCount: cart.items.length,
        deliveryCity: delivery_address.city,
        deliveryStreet: delivery_address.street,
        deliveryZip: delivery_address.zip,
        paymentMethod: payment_method,
        items: {
          create: cart.items.map((item) => ({
            stampId: item.stampId,
            quantity: item.quantity,
            price: item.stamp.price,
            color: item.color,
            inkColor: item.inkColor,
            customText: item.customText,
          })),
        },
      },
      include: {
        items: {
          include: { stamp: { include: { category: true } } },
        },
      },
    });

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  // ── Send Telegram Notification ──────────────────────────
  if (req.body.notify_admin !== false) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        await notifyAdminOrder(order.id, user, cart.items.map(i => ({ name: i.stamp.name, quantity: i.quantity })), total);
      }
    } catch (error) {
      console.error('Failed to send order notification:', error);
    }
  }


  res.status(201).json(formatOrder(order));
};

/**
 * Format order for frontend response
 */
function formatOrder(order: any) {
  return {
    id: order.id,
    status: order.status.toLowerCase(),
    total: order.total,
    items_count: order.itemsCount,
    created_at: order.createdAt.toISOString(),
    delivery_address: order.deliveryCity
      ? {
          city: order.deliveryCity,
          street: order.deliveryStreet,
          zip: order.deliveryZip,
        }
      : undefined,
    payment_method: order.paymentMethod,
    tracking_number: order.trackingNumber,
    items: order.items?.map((item: any) => ({
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
    })),
  };
}
