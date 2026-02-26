const Razorpay = require('razorpay');
require('dotenv').config();

class PaymentService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Create a Razorpay order
   * @param {Object} orderData - Order details including amount, currency, etc.
   * @returns {Object} Razorpay order object
   */
  async createOrder(orderData) {
    try {
      // Validate amount range
      if (orderData.amount < 0.01 || orderData.amount > 100000) {
        throw new Error('Amount must be between ₹0.01 and ₹100000');
      }
      
      const options = {
        amount: Math.round(orderData.amount * 100), // Convert to paise (smallest currency unit)
        currency: orderData.currency || 'INR',
        receipt: orderData.receipt || `receipt_${Date.now()}`,
        payment_capture: orderData.payment_capture || 1, // Auto capture payment
      };

      const order = await this.razorpay.orders.create(options);
      
      // Log successful order creation
      console.log(`Razorpay order created successfully: ${order.id}`);
      
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      // Don't expose internal error details to client
      throw new Error('Payment processing temporarily unavailable. Please try again.');
    }
  }

  /**
   * Verify payment signature
   * @param {Object} paymentData - Payment verification data from frontend
   * @returns {Boolean} True if signature is valid
   */
  async verifyPaymentSignature(paymentData) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

      // Validate required fields
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        console.warn('Missing required payment verification data');
        return false;
      }

      // Create the string to be hashed
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      
      // Import crypto module for signature verification
      const crypto = require('crypto');
      
      // Create hash using the secret key
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      // Compare signatures using timing-safe comparison
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature), 
        Buffer.from(razorpay_signature)
      );
      
      // Log verification result
      if (isValid) {
        console.log(`Payment signature verified successfully for payment: ${razorpay_payment_id}`);
      } else {
        console.warn(`Payment signature verification failed for payment: ${razorpay_payment_id}`);
      }
      
      return isValid;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      // Return false instead of throwing to prevent exposing internal errors
      return false;
    }
  }

  /**
   * Fetch payment details by payment ID
   * @param {string} paymentId - Razorpay payment ID
   * @returns {Object} Payment details
   */
  async fetchPaymentDetails(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw new Error(`Fetching payment details failed: ${error.message}`);
    }
  }

  /**
   * Capture payment (if payment_capture was set to 0 during order creation)
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Amount to capture in paise
   * @returns {Object} Captured payment details
   */
  async capturePayment(paymentId, amount) {
    try {
      const payment_capture = await this.razorpay.payments.capture(paymentId, Math.round(amount * 100));
      return payment_capture;
    } catch (error) {
      console.error('Error capturing payment:', error);
      throw new Error(`Payment capture failed: ${error.message}`);
    }
  }

  /**
   * Refund payment
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Amount to refund in paise
   * @returns {Object} Refund details
   */
  async refundPayment(paymentId, amount) {
    try {
      const refundData = {
        payment_id: paymentId,
      };
      
      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await this.razorpay.payments.refund(refundData);
      return refund;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error(`Payment refund failed: ${error.message}`);
    }
  }
}

module.exports = PaymentService;