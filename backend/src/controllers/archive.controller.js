import { Order } from '../models/Order.js';
import { OrderArchive } from '../models/OrderArchive.js';

/**
 * POST /archive-old-orders
 * Move orders older than N days (default 30 days) to orders_archive
 */
export const archiveOldOrders = async (req, res, next) => {
  try {
    const days = req.body?.days || parseInt(req.query?.days, 10) || 30;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Find orders created before cutoff date
    const eligibleOrders = await Order.find({
      created_at: { $lt: cutoffDate },
    }).lean();

    if (!eligibleOrders || eligibleOrders.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No orders older than ${days} days found to archive`,
        archivedCount: 0,
        cutoffDate,
      });
    }

    // Format items for archive insertion
    const archiveDocs = eligibleOrders.map((order) => ({
      id: order.id,
      store_id: order.store_id,
      items: order.items,
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at,
      archived_at: new Date(),
    }));

    // Batch insert into OrderArchive using unordered insert for performance
    await OrderArchive.insertMany(archiveDocs, { ordered: false });

    // Extract IDs of moved orders and delete from Order collection
    const orderIds = eligibleOrders.map((o) => o._id);
    const deleteResult = await Order.deleteMany({ _id: { $in: orderIds } });

    return res.status(200).json({
      success: true,
      message: `Successfully archived ${deleteResult.deletedCount} orders older than ${days} days`,
      archivedCount: deleteResult.deletedCount,
      cutoffDate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /archive-stats
 * Get overview stats of active vs archived orders
 */
export const getArchiveStats = async (req, res, next) => {
  try {
    const days = parseInt(req.query?.days, 10) || 30;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [activeCount, eligibleForArchiveCount, totalArchivedCount] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ created_at: { $lt: cutoffDate } }),
        OrderArchive.countDocuments(),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        activeCount,
        eligibleForArchiveCount,
        totalArchivedCount,
        daysThreshold: days,
        cutoffDate,
      },
    });
  } catch (error) {
    next(error);
  }
};
