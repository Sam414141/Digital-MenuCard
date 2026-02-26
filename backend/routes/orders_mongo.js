const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { verifyToken, requireStaff } = require('../middleware/auth_mongo');
const mongoose = require('mongoose');
const {
  Order,
  OrderItem,
  MenuItem,
  User,
  Customer,
  KitchenOrder
} = require('../db_mongo');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

/**
 * Get Order History for User
 * GET /api/orders/history
 */
router.get('/history', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    
    // Build query
    const query = { user_id: userId };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }
    };
    
    const orders = await Order.find(query)
      .populate('waiter_id', 'first_name last_name')
      .sort({ createdAt: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
    
    const total = await Order.countDocuments(query);
    
    // Transform orders to match frontend expectations
    const transformedOrders = orders.map(order => ({
      id: order._id,
      table_number: order.table_number,
      total_price: order.total_price,
      totalAmount: order.total_price, // Alias for frontend compatibility
      status: order.status,
      payment_status: order.payment_status,
      order_type: order.order_type,
      items: order.items || [], // Include items if they exist
      createdAt: order.createdAt,
      created_at: order.createdAt, // Alias for frontend compatibility
      updatedAt: order.updatedAt,
      updated_at: order.updatedAt, // Alias for frontend compatibility
      waiter: order.waiter_id
    }));
    
    res.json({
      status: 'success',
      data: {
        orders: transformedOrders,
        pagination: {
          currentPage: options.page,
          totalPages: Math.ceil(total / options.limit),
          totalOrders: total
        }
      }
    });
  } catch (err) {
    // Log full error for better diagnostics
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Get Order by ID
 * GET /api/orders/:id
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const order = await Order.findOne({ _id: id, user_id: userId })
      .populate('waiter_id', 'first_name last_name');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Transform the order to match the expected frontend format
    const transformedOrder = {
      id: order._id,
      user_id: order.user_id,
      waiter_id: order.waiter_id,
      table_number: order.table_number,
      total_price: order.total_price,
      items: order.items || [],
      status: order.status,
      payment_status: order.payment_status,
      order_type: order.order_type,
      special_instructions: order.special_instructions,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
    
    res.json({
      status: 'success',
      data: {
        order: transformedOrder
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Get User Orders
 * GET /api/orders
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.find({ user_id: userId })
      .populate('waiter_id', 'first_name last_name')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Create New Order
 * POST /api/orders
 */
router.post('/', [
  verifyToken,
  body('tableNumber').isInt({ min: 1 }).withMessage('Valid table number is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.menuItemId').notEmpty().withMessage('Menu item ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const { tableNumber, items, specialInstructions, orderType = 'dine_in', paymentStatus, paymentMethod, razorpayOrderId, razorpayPaymentId } = req.body;
    
    // Calculate total price and prepare order items
    let totalPrice = 0;
    const orderItems = [];
    
    for (const item of items) {
      // Try to find menu item by MongoDB ObjectId first
      let menuItem;
      
      // Check if the menuItemId is a string that looks like a MongoDB ObjectId
      if (typeof item.menuItemId === 'string' && mongoose.Types.ObjectId.isValid(item.menuItemId)) {
        try {
          menuItem = await MenuItem.findById(item.menuItemId);
        } catch (castError) {
          // If casting fails, we'll try the numeric approach below
          console.log('ObjectId cast error, falling back to numeric ID lookup');
        }
      }
      
      // If not found by ObjectId, try to find by numeric id field
      if (!menuItem) {
        // Handle both string and number inputs for numeric ID
        const numericId = typeof item.menuItemId === 'string' ? parseInt(item.menuItemId, 10) : item.menuItemId;
        if (!isNaN(numericId)) {
          menuItem = await MenuItem.findOne({ id: numericId });
        }
      }
      
      // If still not found, return error
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item ${item.menuItemId} not found` });
      }
      
      const itemTotal = menuItem.price * item.quantity;
      totalPrice += itemTotal;
      
      orderItems.push({
        item_name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        subtotal: itemTotal,
        customizations: item.customizations || ''
      });
    }
    
    // Create order with Razorpay as the default payment method
    const order = new Order({
      user_id: userId,
      table_number: tableNumber,
      total_price: totalPrice,
      status: 'pending',
      payment_status: paymentStatus || 'pending', // Use provided payment status or default to pending
      payment_method: 'razorpay', // Only Razorpay is supported
      razorpay_order_id: razorpayOrderId, // Store Razorpay order ID if provided
      razorpay_payment_id: razorpayPaymentId, // Store Razorpay payment ID if provided
      special_instructions: specialInstructions,
      order_type: orderType,
      items: orderItems
    });
    
    const savedOrder = await order.save();
    
    // Create kitchen orders for each item
    for (const item of orderItems) {
      const kitchenOrder = new KitchenOrder({
        order_id: savedOrder._id,
        table_number: tableNumber,
        item_name: item.item_name,
        quantity: item.quantity,
        customizations: item.customizations,
        status: 'pending',
        priority_level: 3 // Default priority
      });
      
      await kitchenOrder.save();
    }
    
    // Get user information to send order confirmation email
    const user = await User.findById(userId);
    
    // Send order confirmation email to the user
    try {
      const emailResult = await sendOrderConfirmationEmail(
        user.email,
        user.first_name,
        savedOrder
      );
      
      if (!emailResult.success) {
        console.error('Failed to send order confirmation email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
    }
    
    res.status(201).json({ message: 'Order created successfully', order: savedOrder });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Cancel Order
 * PUT /api/orders/:id/cancel
 */
router.put('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const order = await Order.findOne({ _id: id, user_id: userId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if order can be cancelled
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
    }
    
    const oldStatus = order.status;
    order.status = 'cancelled';
    order.payment_status = 'cancelled';
    await order.save();
    
    // Update kitchen orders
    await KitchenOrder.updateMany(
      { order_id: id },
      { status: 'cancelled' }
    );
    
    // Get user information to send cancellation email
    const user = await User.findById(order.user_id);
    
    // Send order cancellation email to the user
    try {
      const emailResult = await sendOrderCancellationEmail(
        user.email,
        user.first_name,
        order,
        'Order cancelled by customer request'
      );
      
      if (!emailResult.success) {
        console.error('Failed to send order cancellation email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Error sending order cancellation email:', emailError);
    }
    
    res.json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Get All Orders (Admin/Staff)
 * GET /api/orders/all
 */
router.get('/all', [verifyToken, requireStaff], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: [
        { path: 'user_id', select: 'first_name last_name email' },
        { path: 'waiter_id', select: 'first_name last_name' }
      ]
    };
    
    const orders = await Order.find(query)
      .populate('user_id', 'first_name last_name email')
      .populate('waiter_id', 'first_name last_name')
      .sort({ createdAt: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);
    
    const total = await Order.countDocuments(query);

    // Diagnostic logging to help trace intermittent errors
    console.log(`GET /api/orders/all - fetched ${orders.length} orders, page ${options.page}, limit ${options.limit}`);
    if (orders.length > 0) {
      console.log('Sample order IDs:', orders.slice(0,3).map(o => o._id.toString()));
    }

    res.json({
      orders,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(total / options.limit),
        totalOrders: total
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Update Order Payment Status (Staff)
 * PUT /api/orders/:id/payment
 */
router.put('/:id/payment', [
  verifyToken,
  requireStaff,
  body('paymentStatus').isIn(['pending', 'completed', 'failed']).withMessage('Invalid payment status'),
  body('paymentMethod').optional().isIn(['razorpay']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { paymentStatus, paymentMethod } = req.body;
    
    const oldOrder = await Order.findById(id);
    const oldStatus = oldOrder.status;
    const oldPaymentStatus = oldOrder.payment_status;
    
    const order = await Order.findByIdAndUpdate(
      id,
      {
        payment_status: paymentStatus,
        ...(paymentMethod && { payment_method: paymentMethod })
        // Don't automatically set order status to 'completed' when payment is completed
        // Order status should follow the normal workflow: pending → preparing → prepared → served
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get user information to send status update email if status changed
    if (order.status !== oldStatus) {
      const user = await User.findById(order.user_id);
      
      if (user) {
        try {
          const emailResult = await sendOrderStatusUpdateEmail(
            user.email,
            user.first_name,
            order,
            oldStatus,
            order.status
          );
          
          if (!emailResult.success) {
            console.error('Failed to send order status update email:', emailResult.error);
          }
        } catch (emailError) {
          console.error('Error sending order status update email:', emailError);
        }
      }
    }
    
    res.json({ message: 'Order payment status updated successfully', order });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Export router
module.exports = router;