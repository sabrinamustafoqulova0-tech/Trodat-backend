// ===========================================
// Admin Controller
// ===========================================

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

/**
 * GET /api/v1/admin/users
 * Returns list of all registered users
 */
export const getUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.json(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      created_at: u.createdAt.toISOString(),
    }))
  );
};

/**
 * GET /api/v1/admin/orders
 * Returns list of all orders from all users
 */
export const getOrders = async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      items: {
        include: { stamp: true },
      },
    },
  });

  res.json(
    orders.map((o) => ({
      id: o.id,
      status: o.status,
      total: o.total,
      items_count: o.itemsCount,
      created_at: o.createdAt.toISOString(),
      delivery_address: {
        city: o.deliveryCity,
        street: o.deliveryStreet,
        zip: o.deliveryZip,
      },
      payment_method: o.paymentMethod,
      tracking_number: o.trackingNumber,
      user: {
        id: o.user.id,
        name: o.user.name,
        email: o.user.email,
        phone: o.user.phone,
      },
      items: o.items.map((item) => ({
        id: item.id,
        stamp: {
          id: item.stamp.id,
          article: item.stamp.article,
          name: item.stamp.name,
          price: item.stamp.price,
          size: item.stamp.size,
          shape: item.stamp.shape,
          image_main: item.stamp.imageMain,
        },
        quantity: item.quantity,
        price: item.price,
        color: item.color,
        ink_color: item.inkColor,
        custom_text: item.customText,
      })),
    }))
  );
};
