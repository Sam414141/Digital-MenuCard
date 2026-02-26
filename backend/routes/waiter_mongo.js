const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { verifyToken, requireWaiter } = require('../middleware/auth_mongo');
const {
  Order,
  OrderItem,
  KitchenOrder,
  MenuItem,
  User
} = require('../db_mongo');

/**
 * Get Active Orders for Waiter
 * GET /api/waiter/orders
 */
router.get('/orders', [verifyToken, requireWaiter], async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    
    // Only get orders assigned to this waiter or unassigned orders
    const orders = await Order.find(query)
      .populate('user_id', 'first_name last_name')
      .populate('waiter_id', 'first_name last_name')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Assign Order to Waiter
 * PUT /api/waiter/orders/:id/assign
 */
router.put('/orders/:id/assign', [verifyToken, requireWaiter], async (req, res) => {
  try {
    const { id } = req.params;
    const waiterId = req.user.id;
    
    const order = await Order.findByIdAndUpdate(
      id,
      { waiter_id: waiterId },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ message: 'Order assigned successfully', order });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Update Order Status
 * PUT /api/waiter/orders/:id/status
 */
router.put('/orders/:id/status', [
  verifyToken,
  requireWaiter,
  body('status').isIn(['pending', 'prepairing', 'prepaired', 'completed', 'delivered', 'cancelled', 'served']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // If order is completed or served, update payment status
    if (status === 'completed' || status === 'served') {
      order.payment_status = 'completed';
      await order.save();
    }
    
    // WebSocket event emission removed - using polling instead
    
    res.json({ message: 'Order status updated successfully', order });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Get Kitchen Orders
 * GET /api/waiter/kitchen-orders
 */
router.get('/kitchen-orders', [verifyToken, requireWaiter], async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    
    const kitchenOrders = await KitchenOrder.find(query)
      .populate('order_id')
      .sort({ priority_level: 1, createdAt: 1 });
    
    res.json(kitchenOrders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Update Kitchen Order Status
 * PUT /api/waiter/kitchen-orders/:id/status
 */
router.put('/kitchen-orders/:id/status', [
  verifyToken,
  requireWaiter,
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
    );
    
    if (!kitchenOrder) {
      return res.status(404).json({ error: 'Kitchen order not found' });
    }
    
    // Synchronize parent order status based on kitchen orders for this order
    if (kitchenOrder.order_id) {
      // Get all kitchen orders for this parent order
      const parentOrderId = kitchenOrder.order_id._id || kitchenOrder.order_id;
      const allKitchenOrders = await KitchenOrder.find({ order_id: parentOrderId });

      // Quick update: if this item was moved to prepairing, ensure parent moves at least to prepairing
      if (status === 'prepairing') {
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

      // Update the parent order status
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
 * Get Waiter Performance Stats
 * GET /api/waiter/stats
 */
router.get('/stats', [verifyToken, requireWaiter], async (req, res) => {
  try {
    const waiterId = req.user.id;
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get today's orders for this waiter
    const todaysWaiterOrders = await Order.find({
      waiter_id: waiterId,
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Get all waiter orders (for admin access) - only for admin role
    let todaysOrders = todaysWaiterOrders;
    let pendingOrders = 0;
    let servedOrders = 0;
    
    // Check if user is admin to get all waiter stats
    if (req.user.role === 'admin') {
      todaysOrders = await Order.find({
        createdAt: {
          $gte: today,
          $lt: tomorrow
        },
        status: { $in: ['served', 'completed'] }
      });
      
      pendingOrders = await Order.countDocuments({
        status: { $in: ['pending', 'prepairing', 'prepaired'] }
      });
      
      servedOrders = await Order.countDocuments({
        status: 'served',
        createdAt: {
          $gte: today,
          $lt: tomorrow
        }
      });
    } else {
      // For regular waiters
      pendingOrders = await Order.countDocuments({
        waiter_id: waiterId,
        status: { $in: ['pending', 'prepairing', 'prepaired'] }
      });
      
      servedOrders = await Order.countDocuments({
        waiter_id: waiterId,
        status: 'served',
        createdAt: {
          $gte: today,
          $lt: tomorrow
        }
      });
    }
    
    // Get status counts
    const statusCounts = {
      pending: 0,
      preparing: 0,
      prepaired: 0,
      served: 0,
      completed: 0,
      cancelled: 0
    };
    
    // Count all orders by status for the waiter or all waiters
    const allOrders = req.user.role === 'admin' 
      ? await Order.find({})
      : await Order.find({ waiter_id: waiterId });
      
    allOrders.forEach(order => {
      if (statusCounts.hasOwnProperty(order.status)) {
        statusCounts[order.status]++;
      }
    });
    
    res.json({
      todaysOrders: todaysOrders.length,
      pendingOrders,
      servedOrders,
      statusCounts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;