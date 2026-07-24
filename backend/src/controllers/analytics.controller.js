import { Order } from '../models/Order.js';

/**
 * GET /analytics/orders-per-day?store_id=
 * Aggregation pipeline for orders and revenue per day
 */
export const getOrdersPerDay = async (req, res, next) => {
  try {
    const { store_id } = req.query;

    const matchStage = {};
    if (store_id) {
      matchStage.store_id = store_id;
    }

    const pipeline = [
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' },
          },
          order_count: { $sum: 1 },
          daily_revenue: { $sum: '$total_amount' },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          order_count: 1,
          daily_revenue: { $round: ['$daily_revenue', 2] },
        },
      },
      { $sort: { date: 1 } },
    ];

    const result = await Order.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /analytics/revenue-per-store
 * Aggregation pipeline for total revenue per store
 */
export const getRevenuePerStore = async (req, res, next) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$store_id',
          total_revenue: { $sum: '$total_amount' },
          total_orders: { $sum: 1 },
          avg_order_value: { $avg: '$total_amount' },
        },
      },
      {
        $project: {
          _id: 0,
          store_id: '$_id',
          total_revenue: { $round: ['$total_revenue', 2] },
          total_orders: 1,
          avg_order_value: { $round: ['$avg_order_value', 2] },
        },
      },
      { $sort: { total_revenue: -1 } },
    ];

    const result = await Order.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /analytics/top-items?limit=5
 * Aggregation pipeline for top selling items
 */
export const getTopItems = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    const pipeline = [
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.item_id',
          item_name: { $first: '$items.item_name' },
          unit_price: { $first: '$items.price' },
          total_quantity_sold: { $sum: '$items.qty' },
          total_item_revenue: {
            $sum: { $multiply: ['$items.price', '$items.qty'] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          item_id: '$_id',
          item_name: 1,
          unit_price: 1,
          total_quantity_sold: 1,
          total_item_revenue: { $round: ['$total_item_revenue', 2] },
        },
      },
      { $sort: { total_quantity_sold: -1 } },
      { $limit: limit },
    ];

    const result = await Order.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
