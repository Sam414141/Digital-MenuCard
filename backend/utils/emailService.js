/**
 * Email Service Utility
 * Provides email sending functionality using Nodemailer
 */

const nodemailer = require('nodemailer');

/**
 * Create email transporter
 * @returns {object} Nodemailer transporter
 */
const createTransporter = () => {
    // For Gmail, we need specific configuration
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'digitalmenu.org@gmail.com',
            pass: 'jpfv pbft ucpz xkbo' // Your app password
        },
        tls: {
            rejectUnauthorized: false // Only for development, should be true in production
        }
    });

    return transporter;
};

/**
 * Send password reset email
 * @param {string} to - Recipient email address
 * @param {string} firstName - Recipient first name
 * @param {string} resetToken - Password reset token
 * @returns {Promise} Email sending result
 */
const sendPasswordResetEmail = async (to, firstName, resetToken) => {
    try {
        const transporter = createTransporter();
        
        // In a real application, you would use your actual domain
        const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: '"Digital Menu Card" <digitalmenu.org@gmail.com>',
            to,
            subject: 'Password Reset Request - Digital Menu Card',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello ${firstName},</p>
                    <p>We received a request to reset your password for your Digital Menu Card account.</p>
                    <p>To reset your password, click the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #007bff; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
                    <p><strong>This link will expire in 1 hour.</strong></p>
                    <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                    <hr style="margin: 30px 0;">
                    <p style="font-size: 12px; color: #666;">
                        This email was sent by Digital Menu Card System. 
                        If you have any questions, please contact our support team.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent: %s', info.messageId);
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send test email
 * @param {string} to - Recipient email address
 * @returns {Promise} Email sending result
 */
const sendTestEmail = async (to) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: '"Digital Menu Card" <digitalmenu.org@gmail.com>',
            to,
            subject: 'Test Email - Digital Menu Card',
            text: 'This is a test email from the Digital Menu Card system.'
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Test email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending test email:', error);
        return { success: false, error: error.message };
    }
};

// Note: Order is not needed in this file as we're just sending emails, not querying the database

/**
 * Send welcome email on registration
 * @param {string} to - Recipient email address
 * @param {string} firstName - Recipient first name
 * @returns {Promise} Email sending result
 */
const sendWelcomeEmail = async (to, firstName) => {
    try {
        // Clean and validate email address
        if (!to) {
            console.error('Email address is required');
            return { success: false, error: 'Email address is required' };
        }
        
        // Remove any angle brackets or extra characters
        let cleanEmail = to.toString().trim();
        cleanEmail = cleanEmail.replace(/[<>]/g, '');
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            console.error('Invalid email format:', cleanEmail);
            return { success: false, error: 'Invalid email format' };
        }
        
        const transporter = createTransporter();
        
        const mailOptions = {
            from: '"Digital Menu Card" <digitalmenu.org@gmail.com>',
            to,
            subject: 'Welcome to Digital Menu Card!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome ${firstName}!</h2>
                    <p>Thank you for registering with Digital Menu Card.</p>
                    <p>You can now enjoy:</p>
                    <ul>
                        <li>Easy menu browsing</li>
                        <li>Quick online ordering</li>
                        <li>Secure payment processing</li>
                        <li>Order tracking and updates</li>
                    </ul>
                    <p>Start exploring our menu and place your first order!</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/menu" 
                           style="background-color: #28a745; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Browse Menu
                        </a>
                    </div>
                    <hr style="margin: 30px 0;">
                    <p style="font-size: 12px; color: #666;">
                        This email was sent by Digital Menu Card System.
                        If you have any questions, please contact our support team.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent: %s', info.messageId);
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send order confirmation email
 * @param {string} to - Recipient email address
 * @param {string} firstName - Recipient first name
 * @param {object} order - Order object with details
 * @returns {Promise} Email sending result
 */
const sendOrderConfirmationEmail = async (to, firstName, order) => {
    try {
        // Clean and validate email address
        if (!to) {
            console.error('Email address is required');
            return { success: false, error: 'Email address is required' };
        }
        
        // Remove any angle brackets or extra characters
        let cleanEmail = to.toString().trim();
        cleanEmail = cleanEmail.replace(/[<>]/g, '');
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            console.error('Invalid email format:', cleanEmail);
            return { success: false, error: 'Invalid email format' };
        }
        
        const transporter = createTransporter();
        
        // Format order items for display
        const orderItemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.item_name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price ? (item.price * item.quantity).toFixed(2) : item.subtotal.toFixed(2)}</td>
            </tr>
        `).join('');
        
        const mailOptions = {
            from: '"Digital Menu Card" <digitalmenu.org@gmail.com>',
            to: cleanEmail,
            subject: `Order Confirmation - Order #${order._id ? order._id.toString().substring(0, 8) : 'N/A'}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Order Confirmation</h2>
                    <p>Hello ${firstName},</p>
                    <p>Thank you for your order! Here are the details:</p>
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Order Details</h3>
                        <p><strong>Order ID:</strong> ${order._id ? order._id.toString().substring(0, 8) : 'N/A'}</p>
                        <p><strong>Table Number:</strong> ${order.table_number || 'N/A'}</p>
                        <p><strong>Order Type:</strong> ${order.order_type || 'N/A'}</p>
                        <p><strong>Status:</strong> ${order.status || 'Pending'}</p>
                        <p><strong>Payment Status:</strong> ${order.payment_status || 'Pending'}</p>
                        <p><strong>Special Instructions:</strong> ${order.special_instructions || 'None'}</p>
                    </div>
                    <h3>Ordered Items</h3>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <thead>
                            <tr style="background-color: #f2f2f2;">
                                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
                                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
                                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orderItemsHtml}
                            <tr>
                                <td colspan="2" style="padding: 10px; text-align: right; border: 1px solid #ddd;"><strong>Total:</strong></td>
                                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;"><strong>₹${order.total_price ? order.total_price.toFixed(2) : '0.00'}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                    <p>You can track your order status in your account.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/order-history" 
                           style="background-color: #007bff; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            View Order Status
                        </a>
                    </div>
                    <hr style="margin: 30px 0;">
                    <p style="font-size: 12px; color: #666;">
                        This email was sent by Digital Menu Card System.
                        If you have any questions, please contact our support team.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent: %s', info.messageId);
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send order status update email
 * @param {string} to - Recipient email address
 * @param {string} firstName - Recipient first name
 * @param {object} order - Order object with details
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @returns {Promise} Email sending result
 */
const sendOrderStatusUpdateEmail = async (to, firstName, order, oldStatus, newStatus) => {
    try {
        const transporter = createTransporter();
        
        // Define status-specific messages
        const statusMessages = {
            'preparing': 'Your order is now being prepared by our kitchen staff.',
            'ready': 'Your order is ready to be served!',
            'completed': 'Your order has been completed. Enjoy your meal!',
            'cancelled': 'Unfortunately, your order has been cancelled.'
        };
        
        const statusMessage = statusMessages[newStatus] || `Your order status has been updated from ${oldStatus} to ${newStatus}.`;
        
        const mailOptions = {
            from: '"Digital Menu Card" <digitalmenu.org@gmail.com>',
            to,
            subject: `Order Status Update - Order #${order._id ? order._id.toString().substring(0, 8) : 'N/A'}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Order Status Update</h2>
                    <p>Hello ${firstName},</p>
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Order ID:</strong> ${order._id ? order._id.toString().substring(0, 8) : 'N/A'}</p>
                        <p><strong>Previous Status:</strong> ${oldStatus}</p>
                        <p><strong>New Status:</strong> ${newStatus}</p>
                        <p>${statusMessage}</p>
                    </div>
                    <p>Your order details remain the same as when you placed it.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/order-history" 
                           style="background-color: #007bff; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Track Order
                        </a>
                    </div>
                    <hr style="margin: 30px 0;">
                    <p style="font-size: 12px; color: #666;">
                        This email was sent by Digital Menu Card System.
                        If you have any questions, please contact our support team.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order status update email sent: %s', info.messageId);
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending order status update email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send payment confirmation email
 * @param {string} to - Recipient email address
 * @param {string} firstName - Recipient first name
 * @param {object} order - Order object with details
 * @param {string} paymentMethod - Payment method used
 * @returns {Promise} Email sending result
 */
const sendPaymentConfirmationEmail = async (to, firstName, order, paymentMethod) => {
    try {
        // Clean and validate email address
        if (!to) {
            console.error('Email address is required');
            return { success: false, error: 'Email address is required' };
        }
        
        // Remove any angle brackets or extra characters
        let cleanEmail = to.toString().trim();
        cleanEmail = cleanEmail.replace(/[<>]/g, '');
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            console.error('Invalid email format:', cleanEmail);
            return { success: false, error: 'Invalid email format' };
        }
        
        const transporter = createTransporter();
        
        const mailOptions = {
            from: '"Digital Menu Card" <digitalmenu.org@gmail.com>',
            to: cleanEmail,
            subject: `Payment Confirmation - Order #${order._id ? order._id.toString().substring(0, 8) : 'N/A'}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #28a745;">Payment Confirmed</h2>
                    <p>Hello ${firstName},</p>
                    <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                        <p><strong>Transaction Successful!</strong></p>
                        <p>Your payment for order #${order._id ? order._id.toString().substring(0, 8) : 'N/A'} has been processed successfully.</p>
                    </div>
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Payment Details</h3>
                        <p><strong>Order ID:</strong> ${order._id ? order._id.toString().substring(0, 8) : 'N/A'}</p>
                        <p><strong>Amount Paid:</strong> ₹${order.total_price ? order.total_price.toFixed(2) : '0.00'}</p>
                        <p><strong>Payment Method:</strong> ${paymentMethod || 'N/A'}</p>
                        <p><strong>Payment Status:</strong> Completed</p>
                        <p><strong>Transaction ID:</strong> ${order.razorpay_payment_id || 'N/A'}</p>
                    </div>
                    <p>Your order is now being processed. You will receive status updates as it progresses.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/order-history" 
                           style="background-color: #007bff; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            View Order Status
                        </a>
                    </div>
                    <hr style="margin: 30px 0;">
                    <p style="font-size: 12px; color: #666;">
                        This email was sent by Digital Menu Card System.
                        If you have any questions, please contact our support team.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Payment confirmation email sent: %s', info.messageId);
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending payment confirmation email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send order cancellation email
 * @param {string} to - Recipient email address
 * @param {string} firstName - Recipient first name
 * @param {object} order - Order object with details
 * @param {string} reason - Reason for cancellation
 * @returns {Promise} Email sending result
 */
const sendOrderCancellationEmail = async (to, firstName, order, reason) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: '"Digital Menu Card" <digitalmenu.org@gmail.com>',
            to,
            subject: `Order Cancellation - Order #${order._id ? order._id.toString().substring(0, 8) : 'N/A'}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc3545;">Order Cancelled</h2>
                    <p>Hello ${firstName},</p>
                    <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
                        <p><strong>Your order has been cancelled.</strong></p>
                        <p><strong>Reason:</strong> ${reason || 'General cancellation'}</p>
                    </div>
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Order Details</h3>
                        <p><strong>Order ID:</strong> ${order._id ? order._id.toString().substring(0, 8) : 'N/A'}</p>
                        <p><strong>Table Number:</strong> ${order.table_number || 'N/A'}</p>
                        <p><strong>Cancellation Date:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    <p>If you believe this was an error or have questions, please contact our support team.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/contact" 
                           style="background-color: #007bff; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Contact Support
                        </a>
                    </div>
                    <hr style="margin: 30px 0;">
                    <p style="font-size: 12px; color: #666;">
                        This email was sent by Digital Menu Card System.
                        If you have any questions, please contact our support team.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order cancellation email sent: %s', info.messageId);
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending order cancellation email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendTestEmail,
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendOrderStatusUpdateEmail,
    sendPaymentConfirmationEmail,
    sendOrderCancellationEmail
};