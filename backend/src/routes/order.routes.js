import express from 'express';
import {
  createOrder,
  getOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { validate } from '../middlewares/validate.js';
import {
  createOrderSchema,
  updateStatusSchema,
} from '../validators/order.validator.js';

const router = express.Router();

// POST /orders -> Create new order with Zod validation
router.post('/orders', validate(createOrderSchema), createOrder);

// GET /orders?store_id=... -> Fetch paginated orders by store/status
router.get('/orders', getOrders);

// PATCH /orders/:id/status -> Update status with Zod validation
router.patch('/orders/:id/status', validate(updateStatusSchema), updateOrderStatus);

export default router;
