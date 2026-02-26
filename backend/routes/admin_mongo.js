const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth_mongo');
const {
  Order,
  OrderItem,
  MenuItem,
  User,
  Category,
  Feedback,
  Contact
} = require('../db_mongo');

/**
 * Get All Customers (Admin)
 * GET /api/admin/customers
 */
router.get('/customers', [verifyToken, requireAdmin], async (req, res) => {
  try {
    // Get all users who are customers (not staff or admin)
    const customers = await User.find({
      $or: [
        { role: 'customer' },
        { role: null },
        { role: undefined }
      ]
    }).select('first_name last_name email phone createdAt');

    // Format the customers to match the frontend expectations
    const formattedCustomers = customers.map(customer => ({
      id: customer._id.toString(),
      name: `${customer.first_name} ${customer.last_name}`,
      email: customer.email || 'N/A',
      phone: customer.phone || 'N/A',
      created_at: customer.createdAt
    }));

    res.json({
      status: 'success',
      data: formattedCustomers
    });
  } catch (err) {
    console.error('Error fetching customers:', err.message);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: err.message 
    });
  }
});

/**
 * Get All Orders (Admin)
 * GET /api/admin/orders
 */
router.get('/orders', [verifyToken, requireAdmin], async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user_id', 'first_name last_name email')
      .sort({ createdAt: -1 });

    // Format the orders to match the frontend expectations
    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),
      customer_id: order.user_id ? order.user_id._id.toString() : null,
      table_number: order.table_number,
      status: order.status,
      total_price: order.total_price,
      created_at: order.createdAt,
      user: order.user_id ? {
        first_name: order.user_id.first_name,
        last_name: order.user_id.last_name,
        email: order.user_id.email
      } : null
    }));

    res.json({
      status: 'success',
      data: formattedOrders
    });
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: err.message 
    });
  }
});

/**
 * Get Sales Summary (Admin)
 * GET /api/admin/sales-summary
 */
router.get('/sales-summary', [verifyToken, requireAdmin], async (req, res) => {
  try {
    // Get all completed orders
    const completedOrders = await Order.find({ status: 'completed' });

    // Calculate sales by category
    const categorySales = {
      starters: { units: 0, revenue: 0 },
      main_courses: { units: 0, revenue: 0 },
      desserts: { units: 0, revenue: 0 },
      drinks: { units: 0, revenue: 0 }
    };

    completedOrders.forEach(order => {
      order.items.forEach(item => {
        // Determine category based on item name or other logic
        let category = 'other';
        const itemName = item.item_name.toLowerCase();
        
        if (itemName.includes('starter') || itemName.includes('appetizer') || 
            itemName.includes('bread') || itemName.includes('soup') || itemName.includes('salad')) {
          category = 'starters';
        } else if (itemName.includes('main') || itemName.includes('course') || 
                  itemName.includes('steak') || itemName.includes('chicken') || 
                  itemName.includes('fish') || itemName.includes('pasta') || 
                  itemName.includes('burger') || itemName.includes('sandwich')) {
          category = 'main_courses';
        } else if (itemName.includes('dessert') || itemName.includes('cake') || 
                  itemName.includes('ice cream') || itemName.includes('pudding') || 
                  itemName.includes('pie')) {
          category = 'desserts';
        } else if (itemName.includes('drink') || itemName.includes('beverage') || 
                  itemName.includes('tea') || itemName.includes('coffee') || 
                  itemName.includes('juice') || itemName.includes('soda') || 
                  itemName.includes('water')) {
          category = 'drinks';
        }

        if (categorySales[category]) {
          categorySales[category].units += item.quantity;
          categorySales[category].revenue += item.subtotal;
        }
      });
    });

    res.json({
      total_starters_sold: categorySales.starters.units,
      starters_revenue: parseFloat(categorySales.starters.revenue.toFixed(2)),
      total_main_courses_sold: categorySales.main_courses.units,
      main_courses_revenue: parseFloat(categorySales.main_courses.revenue.toFixed(2)),
      total_desserts_sold: categorySales.desserts.units,
      desserts_revenue: parseFloat(categorySales.desserts.revenue.toFixed(2)),
      total_drinks_sold: categorySales.drinks.units,
      drinks_revenue: parseFloat(categorySales.drinks.revenue.toFixed(2))
    });
  } catch (err) {
    console.error('Error fetching sales summary:', err.message);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: err.message 
    });
  }
});

/**
 * Get Feedbacks (Admin)
 * GET /api/admin/showfeedback
 */
router.get('/showfeedback', [verifyToken, requireAdmin], async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
    
    // Format the feedbacks with enhanced information
    const formattedFeedbacks = feedbacks.map(feedback => ({
      id: feedback._id.toString(),
      email: feedback.email || 'Anonymous',
      message: feedback.message || '',
      rating: feedback.rating || 0,
      sentiment_score: feedback.sentiment_score || 0,
      sentiment_category: feedback.sentiment_category || 'neutral',
      created_at: feedback.createdAt,
      updated_at: feedback.updatedAt,
      order_id: feedback.order_id || null,
      metadata: feedback.metadata || {},
      // Enhanced fields for better admin display
      overall_experience: feedback.metadata?.overallExperience || '',
      food_quality: feedback.metadata?.foodQuality || 0,
      service_rating: feedback.metadata?.serviceRating || 0,
      ambience_rating: feedback.metadata?.ambienceRating || 0,
      would_recommend: feedback.metadata?.wouldRecommend || null,
      customer_name: feedback.metadata?.customerName || '',
      table_number: feedback.metadata?.tableNumber || '',
      mobile_number: feedback.metadata?.mobileNumber || ''
    }));
    
    res.json({
      status: 'success',
      data: formattedFeedbacks
    });
  } catch (err) {
    console.error('Error fetching feedbacks:', err.message);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: err.message 
    });
  }
});

/**
 * Get Contact Us Reports (Admin)
 * GET /api/admin/showcontact
 */
router.get('/showcontact', [verifyToken, requireAdmin], async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    
    // Format the contacts to match the frontend expectations
    const formattedContacts = contacts.map(contact => ({
      id: contact._id.toString(),
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      subject: contact.subject,
      message: contact.message,
      createdAt: contact.createdAt
    }));
    
    res.json({
      status: 'success',
      data: formattedContacts
    });
  } catch (err) {
    console.error('Error fetching contact reports:', err.message);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: err.message 
    });
  }
});

module.exports = router;