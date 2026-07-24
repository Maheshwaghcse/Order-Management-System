import express from 'express';
import {
  archiveOldOrders,
  getArchiveStats,
} from '../controllers/archive.controller.js';

const router = express.Router();

// POST /archive-old-orders -> Archive orders older than N days (default 30)
router.post('/archive-old-orders', archiveOldOrders);

// GET /archive-stats -> Stats on active vs archived orders
router.get('/archive-stats', getArchiveStats);

export default router;
