const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { verifyToken } = require('../middleware/auth_mongo');
const { Order, User } = require('../db_mongo');
const PaymentService = require('../services/paymentService');
const { sendPaymentConfirmationEmail } = require('../utils/emailService');

const paymentService = new PaymentService();

// Rate limiting for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many payment requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 verification attempts per windowMs
  message: {
    status: 'error',
    message: 'Too many verification attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Create a Razorpay order
 * POST /api/payments/create-order
 */
router.post('/create-order', [
  paymentLimiter,
  verifyToken,
  body('amount').isFloat({ min: 0.01, max: 100000 }).withMessage('Amount must be between ₹0.01 and ₹100000')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount } = req.body;
    const userId = req.user.id;

    // Validate amount is positive
    if (amount <= 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Amount must be greater than 0' 
      });
    }

    // Create a temporary order ID for the receipt
    const temporaryOrderId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create Razorpay order
    const razorpayOrder = await paymentService.createOrder({
      amount: amount,
      currency: 'INR',
      receipt: `order_${temporaryOrderId}`
    });

    res.json({
      status: 'success',
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        createdAt: razorpayOrder.created_at
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to create payment order' 
    });
  }
});

/**
 * Verify payment and create/update order
 * POST /api/payments/verify
 */
router.post('/verify', [
  verificationLimiter,
  verifyToken,
  body('orderId').notEmpty().withMessage('Razorpay order ID is required'),
  body('paymentId').notEmpty().withMessage('Razorpay payment ID is required'),
  body('signature').notEmpty().withMessage('Payment signature is required'),
  // Note: order_id is optional now since order is created after payment
  body('order_id').optional().isMongoId().withMessage('Valid system order ID is required if provided')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { orderId, paymentId, signature, order_id } = req.body;
    const userId = req.user.id;

    // Log payment verification attempt for security monitoring
    console.log(`Payment verification attempt - User: ${userId}, Payment: ${paymentId}`);
    
    // Verify the payment signature
    const isValidSignature = await paymentService.verifyPaymentSignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature
    });

    if (!isValidSignature) {
      console.warn(`Invalid payment signature attempt - User: ${userId}, Payment: ${paymentId}`);
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid payment signature' 
      });
    }

    // Check if a system order ID was provided
    if (order_id) {
      // If order_id is provided, verify it belongs to the user and update it
      const order = await Order.findOne({ _id: order_id, user_id: userId });
      
      if (!order) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Order not found or does not belong to user' 
        });
      }

      // Update the order with payment information
      order.payment_method = 'razorpay';
      order.payment_status = 'completed';
      order.razorpay_payment_id = paymentId;
      order.razorpay_order_id = orderId;

      await order.save();
      
      // Get user information to send payment confirmation email
      const user = await User.findById(order.user_id);
      
      // Send payment confirmation email to the user
      try {
        const emailResult = await sendPaymentConfirmationEmail(
          user.email,
          user.first_name,
          order,
          'razorpay'
        );
        
        if (!emailResult.success) {
          console.error('Failed to send payment confirmation email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending payment confirmation email:', emailError);
      }

      res.json({
        status: 'success',
        message: 'Payment verified and order updated successfully',
        data: {
          orderId: order._id,
          paymentId: paymentId,
          status: 'completed'
        }
      });
    } else {
      // If no order_id provided, the order will be created by the frontend after verification
      // Just verify the payment and return success
      res.json({
        status: 'success',
        message: 'Payment verified successfully',
        data: {
          paymentId: paymentId,
          status: 'verified'
        }
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Payment verification failed' 
    });
  }
});

/**
 * Webhook endpoint for Razorpay (will be configured in Razorpay dashboard)
 * POST /api/payments/webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.get('X-Razorpay-Signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET; // This should be set in environment variables

    // If webhook secret is not configured, skip verification (not recommended for production)
    if (!webhookSecret) {
      console.warn('Warning: Razorpay webhook secret not configured. Skipping signature verification.');
    } else {
      // Verify webhook signature
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      const isValid = expectedSignature === signature;
      
      if (!isValid) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Invalid webhook signature' 
        });
      }
    }

    // Extract event details
    const event = req.body;
    const eventType = event.event;
    const paymentEntity = event.payload.payment.entity;

    console.log(`Received Razorpay webhook: ${eventType}`, paymentEntity);

    // Update order based on payment status
    const orderId = paymentEntity.notes.order_id; // This would be passed as a note during order creation

    if (orderId) {
      const order = await Order.findOne({ razorpay_order_id: paymentEntity.order_id });

      if (order) {
        const oldStatus = order.payment_status;
        
        // Update payment status based on Razorpay event
        switch (eventType) {
          case 'payment.captured':
            order.payment_status = 'completed';
            // Keep order status as 'pending' initially, it will be updated through the normal workflow
            break;
          case 'payment.failed':
            order.payment_status = 'failed';
            break;
          case 'payment.refunded':
            order.payment_status = 'refunded';
            break;
          default:
            console.log(`Unhandled event type: ${eventType}`);
        }

        order.razorpay_payment_id = paymentEntity.id;
        await order.save();
        
        // Get user information to send payment status update email
        const user = await User.findById(order.user_id);
        
        if (user) {
          try {
            if (eventType === 'payment.captured') {
              // Send payment confirmation email
              const emailResult = await sendPaymentConfirmationEmail(
                user.email,
                user.first_name,
                order,
                order.payment_method || 'razorpay'
              );
              
              if (!emailResult.success) {
                console.error('Failed to send payment confirmation email:', emailResult.error);
              }
            } else if (eventType === 'payment.failed') {
              // For failed payments, we could send a notification
              console.log(`Payment failed for order ${order._id}. User notified via webhook.`);
            }
          } catch (emailError) {
            console.error('Error sending payment status email:', emailError);
          }
        }
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Webhook processing failed' 
    });
  }
});

/**
 * Get payment details
 * GET /api/payments/details/:paymentId
 */
router.get('/details/:paymentId', verifyToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Fetch payment details from Razorpay
    const paymentDetails = await paymentService.fetchPaymentDetails(paymentId);

    res.json({
      status: 'success',
      data: paymentDetails
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch payment details' 
    });
  }
});

/**
 * Refund a payment
 * POST /api/payments/refund
 */
router.post('/refund', [
  verifyToken,
  body('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Valid refund amount is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { paymentId, amount } = req.body;

    // Process refund
    const refund = await paymentService.refundPayment(paymentId, amount);

    res.json({
      status: 'success',
      message: 'Refund processed successfully',
      data: refund
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Refund processing failed' 
    });
  }
});

module.exports = router;