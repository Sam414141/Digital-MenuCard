const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { verifyToken, requireAdmin } = require('../middleware/auth_mongo');
const {
  Promotion,
  MenuItem
} = require('../db_mongo');

/**
 * Get All Promotions
 * GET /api/promotions
 */
router.get('/', async (req, res) => {
  try {
    const { activeOnly } = req.query;
    
    let query = {};
    if (activeOnly === 'true') {
      const now = new Date();
      query = {
        valid_from: { $lte: now },
        valid_to: { $gte: now }
      };
    }
    
    const promotions = await Promotion.find(query).sort({ createdAt: -1 });
    
    res.json(promotions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/*
 * Get Promotion Analytics
 * GET /api/promotions/analytics
 */
router.get('/analytics', [verifyToken, requireAdmin], async (req, res) => {
  try {
    // Get analytics data for promotions
    const promotions = await Promotion.find({}).sort({ createdAt: -1 });
    
    // Calculate various analytics
    const totalPromotions = promotions.length;
    
    // Count active vs inactive promotions
    const now = new Date();
    const activePromotions = promotions.filter(promo => 
      now >= promo.valid_from && now <= promo.valid_to
    ).length;
    
    const inactivePromotions = totalPromotions - activePromotions;
    
    // Calculate average discount value
    const totalDiscountValue = promotions.reduce((sum, promo) => sum + promo.discount_value, 0);
    const averageDiscountValue = totalPromotions > 0 ? totalDiscountValue / totalPromotions : 0;
    
    // Get most common discount type
    const discountTypeCounts = promotions.reduce((counts, promo) => {
      counts[promo.discount_type] = (counts[promo.discount_type] || 0) + 1;
      return counts;
    }, {});
    
    // Get promotions by creation date (for trend analysis)
    const promotionsByDate = promotions.reduce((grouped, promo) => {
      const date = promo.createdAt.toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
      return grouped;
    }, {});
    
    res.json({
      summary: {
        totalPromotions,
        activePromotions,
        inactivePromotions,
        averageDiscountValue,
        discountTypeDistribution: discountTypeCounts
      },
      trends: {
        promotionsByDate
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Get Promotion by ID
 * GET /api/promotions/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const promotion = await Promotion.findById(id);
    
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    res.json(promotion);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Create New Promotion
 * POST /api/promotions
 */
router.post('/', [
  verifyToken,
  requireAdmin,
  body('name').notEmpty().withMessage('Promotion name is required'),
  body('discount_type').isIn(['percentage', 'fixed_amount', 'buy_get']).withMessage('Invalid discount type'),
  body('discount_value').isFloat({ min: 0 }).withMessage('Valid discount value is required'),
  body('valid_from').isISO8601().withMessage('Valid from date is required'),
  body('valid_to').isISO8601().withMessage('Valid to date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      name,
      description,
      discount_type,
      discount_value,
      valid_from,
      valid_to,
      applicable_items,
      minimum_order_value,
      usage_limit
    } = req.body;
    
    const promotion = new Promotion({
      name,
      description,
      discount_type,
      discount_value: parseFloat(discount_value),
      valid_from: new Date(valid_from),
      valid_to: new Date(valid_to),
      applicable_items: applicable_items || [],
      minimum_order_value: minimum_order_value ? parseFloat(minimum_order_value) : null,
      usage_limit: usage_limit ? parseInt(usage_limit) : null,
      created_by: req.user.id
    });
    
    const savedPromotion = await promotion.save();
    
    res.status(201).json({ message: 'Promotion created successfully', promotion: savedPromotion });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Update Promotion
 * PUT /api/promotions/:id
 */
router.put('/:id', [
  verifyToken,
  requireAdmin,
  body('discount_value').optional().isFloat({ min: 0 }).withMessage('Valid discount value is required'),
  body('valid_from').optional().isISO8601().withMessage('Valid from date is required'),
  body('valid_to').optional().isISO8601().withMessage('Valid to date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const {
      name,
      description,
      discount_type,
      discount_value,
      valid_from,
      valid_to,
      applicable_items,
      minimum_order_value,
      usage_limit
    } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (discount_type !== undefined) updateData.discount_type = discount_type;
    if (discount_value !== undefined) updateData.discount_value = parseFloat(discount_value);
    if (valid_from !== undefined) updateData.valid_from = new Date(valid_from);
    if (valid_to !== undefined) updateData.valid_to = new Date(valid_to);
    if (applicable_items !== undefined) updateData.applicable_items = applicable_items;
    if (minimum_order_value !== undefined) updateData.minimum_order_value = parseFloat(minimum_order_value);
    if (usage_limit !== undefined) updateData.usage_limit = parseInt(usage_limit);
    
    const promotion = await Promotion.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    res.json({ message: 'Promotion updated successfully', promotion });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Delete Promotion
 * DELETE /api/promotions/:id
 */
router.delete('/:id', [verifyToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    
    const promotion = await Promotion.findByIdAndDelete(id);
    
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    res.json({ message: 'Promotion deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Apply Promotion to Order
 * POST /api/promotions/:id/apply
 */
router.post('/:id/apply', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { orderItems, orderTotal } = req.body;
    
    const promotion = await Promotion.findById(id);
    
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    // Check if promotion is active
    const now = new Date();
    if (now < promotion.valid_from || now > promotion.valid_to) {
      return res.status(400).json({ error: 'Promotion is not active' });
    }
    
    // Check minimum order value
    if (promotion.minimum_order_value && orderTotal < promotion.minimum_order_value) {
      return res.status(400).json({ 
        error: `Minimum order value of ${promotion.minimum_order_value} required` 
      });
    }
    
    // Calculate discount
    let discountAmount = 0;
    
    switch (promotion.discount_type) {
      case 'percentage':
        discountAmount = orderTotal * (promotion.discount_value / 100);
        break;
      case 'fixed_amount':
        discountAmount = Math.min(promotion.discount_value, orderTotal);
        break;
      case 'buy_get':
        // Simplified buy-get logic
        // In a real implementation, this would be more complex
        discountAmount = 0;
        break;
    }
    
    const discountedTotal = Math.max(0, orderTotal - discountAmount);
    
    res.json({
      promotion: {
        id: promotion._id,
        name: promotion.name,
        description: promotion.description
      },
      discountAmount,
      originalTotal: orderTotal,
      discountedTotal
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;