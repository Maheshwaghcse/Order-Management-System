import { z } from 'zod';

export const createOrderSchema = z.object({
  store_id: z.string({ required_error: 'store_id is required' }).min(1, 'store_id cannot be empty'),
  items: z
    .array(
      z.object({
        item_id: z.string().min(1, 'item_id is required'),
        item_name: z.string().min(1, 'item_name is required'),
        price: z.number().positive('Price must be greater than 0'),
        qty: z.number().int().positive('Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one item is required in the order'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['PLACED', 'PREPARING', 'COMPLETED'], {
    errorMap: () => ({ message: 'Status must be PLACED, PREPARING, or COMPLETED' }),
  }),
});

export const archiveOrdersSchema = z.object({
  days: z.number().int().min(1).default(30),
});
