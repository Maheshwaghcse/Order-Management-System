import express from 'express';
import {
  getOrdersPerDay,
  getRevenuePerStore,
  getTopItems,
} from '../controllers/analytics.controller.js';

const router = express.Router();

// GET /analytics/orders-per-day?store_id=
router.get('/analytics/orders-per-day', getOrdersPerDay);

// GET /analytics/revenue-per-store
router.get('/analytics/revenue-per-store', getRevenuePerStore);

// GET /analytics/top-items?limit=5
router.get('/analytics/top-items', getTopItems);

export default router;
