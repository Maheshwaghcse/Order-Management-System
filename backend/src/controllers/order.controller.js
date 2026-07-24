import { Order } from '../models/Order.js';
import { emitOrderCreated, emitOrderUpdated } from '../sockets/socket.service.js';

// Helper to generate a clean order ID
const generateOrderId = () => {
  const prefix = 'ORD';
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${randomStr}`;
};

/**
 * POST /orders
 * Create a new order
 */
export const createOrder = async (req, res, next) => {
  try {
    const { store_id, items } = req.body;

    // Calculate total amount from items
    const total_amount = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.qty),
      0
    );

    const orderId = generateOrderId();

    const newOrder = await Order.create({
      id: orderId,
      store_id,
      items,
      total_amount,
      status: 'PLACED',
      created_at: new Date(),
    });

    // Emit real-time WebSocket notification
    emitOrderCreated(newOrder);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /orders?store_id=&page=&limit=&status=
 * Fetch orders by store (with pagination & optional status filter)
 */
export const getOrders = async (req, res, next) => {
  try {
    const { store_id, status, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query utilizing compound indexes
    const filter = {};
    if (store_id) {
      filter.store_id = store_id;
    }
    if (status) {
      filter.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /orders/:id/status
 * Update order status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find by custom 'id' or fallback to MongoDB '_id'
    const order = await Order.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID '${id}' not found`,
      });
    }

    order.status = status;
    await order.save();

    // Emit real-time WebSocket notification
    emitOrderUpdated(order);

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
