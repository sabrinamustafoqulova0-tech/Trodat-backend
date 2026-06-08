// ===========================================
// Order Validation Schemas (Zod)
// ===========================================

import { z } from 'zod';

export const createOrderSchema = z.object({
  delivery_address: z.object({
    city: z.string().min(1, 'City is required'),
    street: z.string().min(1, 'Street is required'),
    zip: z.string().min(1, 'ZIP code is required'),
  }),
  payment_method: z.string().min(1, 'Payment method is required'),
  notify_admin: z.boolean().optional().default(true),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
