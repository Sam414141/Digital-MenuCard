const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { verifyToken, requireKitchenStaff } = require('../middleware/auth_mongo');
const {
  Order,
  OrderItem,
  KitchenOrder,
  MenuItem,
  User
} = require('../db_mongo');

/**
 * Get Kitchen Orders
 * GET /api/kitchen/orders
 */
router.get('/orders', [verifyToken, requireKitchenStaff], async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build query
    const query = {};
    if (status) {
      // Handle both single status and array of statuses
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }
    
    const kitchenOrders = await KitchenOrder.find(query)
      .populate({
        path: 'order_id',
        populate: {
          path: 'user_id',
          select: 'first_name last_name'
        }
      })
      .sort({ priority_level: 1, createdAt: 1 });
    
    res.json(kitchenOrders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
/**
 * Update Kitchen Order Status
 * PUT /api/kitchen/orders/:id/status
 */
router.put('/orders/:id/status', [
  verifyToken,
  requireKitchenStaff,
  body('status').isIn(['pending', 'prepairing', 'prepaired', 'completed', 'cancelled', 'served']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    const kitchenOrder = await KitchenOrder.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('order_id');
    
    if (!kitchenOrder) {
      return res.status(404).json({ error: 'Kitchen order not found' });
    }
    
    // Synchronize parent order status based on kitchen orders for this order
    if (kitchenOrder.order_id) {
      // Get all kitchen orders for this parent order
      const parentOrderId = kitchenOrder.order_id._id || kitchenOrder.order_id;
      const allKitchenOrders = await KitchenOrder.find({ order_id: parentOrderId });

      // Quick update: if this item was moved to prepairing, ensure parent moves at least to prepairing
      // This guarantees the parent order reflects "Prepairing" as soon as any item starts being prepared.
      if (status === 'prepairing') {
        // Only escalate if parent is still pending
        const parentOrder = await Order.findById(parentOrderId).select('status');
        if (parentOrder && parentOrder.status === 'pending') {
          await Order.findByIdAndUpdate(parentOrderId, { status: 'prepairing' }, { new: true });
        }
      }

      // Determine the overall status for the parent order based on all children
      let parentOrderStatus = 'pending'; // default status
      const statuses = allKitchenOrders.map(ko => ko.status);

      // If all kitchen orders are served, set parent order to served
      if (statuses.length > 0 && statuses.every(s => s === 'served')) {
        parentOrderStatus = 'served';
      }
      // If all kitchen orders are prepaired, set parent order to prepaired
      else if (statuses.length > 0 && statuses.every(s => s === 'prepaired')) {
        parentOrderStatus = 'prepaired';
      }
      // If any kitchen order is prepairing, set parent order to prepairing
      else if (statuses.some(s => s === 'prepairing')) {
        parentOrderStatus = 'prepairing';
      }
      // If all kitchen orders are completed, set parent order to completed
      else if (statuses.length > 0 && statuses.every(s => s === 'completed')) {
        parentOrderStatus = 'completed';
      }

      // Update the parent order status (this may overwrite the quick escalation above if a different aggregate result applies)
      await Order.findByIdAndUpdate(parentOrderId, { status: parentOrderStatus }, { new: true });
    }
    
    // WebSocket event emission removed - using polling instead
    
    res.json({ message: 'Kitchen order status updated successfully', kitchenOrder });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Get Kitchen Performance Stats
 * GET /api/kitchen/stats
 */
router.get('/stats', [verifyToken, requireKitchenStaff], async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get today's orders
    const todaysOrders = await KitchenOrder.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Count orders by status
    const statusCounts = {
      pending: 0,
      prepairing: 0,
      prepaired: 0,
      completed: 0,
      cancelled: 0
    };
    
    todaysOrders.forEach(order => {
      statusCounts[order.status]++;
    });
    
    // Get pending orders
    const pendingOrders = await KitchenOrder.countDocuments({ status: 'pending' });
    
    res.json({
      todaysOrders: todaysOrders.length,
      pendingOrders,
      statusCounts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;