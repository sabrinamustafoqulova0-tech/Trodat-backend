// ===========================================
// Cart Validation Schemas (Zod)
// ===========================================

import { z } from 'zod';

export const addToCartSchema = z.object({
  stamp_id: z.string().uuid('Invalid stamp ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99),
  color: z.string().min(1, 'Color is required'),
  ink_color: z.string().min(1, 'Ink color is required'),
  custom_text: z.string().max(500).optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
