const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { verifyToken, requireAdmin } = require('../middleware/auth_mongo');
const {
  Inventory
} = require('../db_mongo');

/**
 * Get All Inventory Items
 * GET /api/inventory
 */
router.get('/', [verifyToken, requireAdmin], async (req, res) => {
  try {
    const { lowStockOnly } = req.query;
    
    let query = {};
    if (lowStockOnly === 'true') {
      query = { $expr: { $lte: ['$quantity', '$reorder_level'] } };
    }
    
    const inventoryItems = await Inventory.find(query).sort({ ingredient_name: 1 });
    
    res.json(inventoryItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Get Inventory Alerts
 * GET /api/inventory/alerts
 */
router.get('/alerts', [verifyToken, requireAdmin], async (req, res) => {
  try {
    // Find inventory items where quantity is below reorder level (critical and urgent alerts)
    const inventoryItems = await Inventory.find({}).sort({ ingredient_name: 1 });
    
    const alerts = inventoryItems.map(item => {
      let alertLevel = 'good';
      // Check if reorder_level is defined and not null before using it
      const reorderLevel = item.reorder_level !== undefined && item.reorder_level !== null ? item.reorder_level : 0;
      
      if (reorderLevel > 0 && item.quantity <= reorderLevel) {
        if (item.quantity === 0) {
          alertLevel = 'critical';
        } else if (item.quantity <= reorderLevel * 0.5) {
          alertLevel = 'critical';
        } else {
          alertLevel = 'urgent';
        }
      } else if (reorderLevel > 0 && item.quantity <= reorderLevel * 1.5) {
        alertLevel = 'low';
      }
      
      return {
        id: item._id,
        ingredient_name: item.ingredient_name,
        quantity: item.quantity,
        unit: item.unit,
        reorder_level: item.reorder_level,
        alert_level: alertLevel,
        updated_at: item.updated_at
      };
    }).filter(alert => alert.alert_level !== 'good'); // Only return items that have alerts
    
    res.json(alerts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Get Inventory Report
 * GET /api/inventory/report
 */
router.get('/report', [verifyToken, requireAdmin], async (req, res) => {
  try {
    const inventoryItems = await Inventory.find({}).sort({ ingredient_name: 1 });
    
    // Calculate summary
    const totalIngredients = inventoryItems.length;
    const totalStockUnits = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockCount = inventoryItems.filter(item => 
      item.reorder_level !== undefined && item.reorder_level !== null && item.reorder_level > 0 && item.quantity <= item.reorder_level
    ).length;
    
    // Calculate inventory turnover (simplified version - based on usage patterns)
    const inventoryTurnover = inventoryItems
      .filter(item => item.quantity > 0) // Only items with stock
      .sort((a, b) => b.quantity - a.quantity) // Sort by quantity descending
      .slice(0, 10) // Take top 10
      .map(item => ({
        ingredient_name: item.ingredient_name,
        current_stock: item.quantity,
        unit: item.unit,
        total_used: Math.floor(item.quantity * 0.7), // Placeholder calculation
        days_of_stock_remaining: item.quantity > 0 ? Math.floor(item.quantity / 2) : 0 // Placeholder calculation
      }));
    
    const report = {
      summary: {
        total_ingredients: totalIngredients,
        total_stock_units: totalStockUnits,
        low_stock_count: lowStockCount
      },
      inventory_turnover: inventoryTurnover
    };
    
    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Get Inventory Item by ID
 * GET /api/inventory/:id
 */
router.get('/:id', [verifyToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    
    const inventoryItem = await Inventory.findById(id);
    
    if (!inventoryItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json(inventoryItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Add New Inventory Item
 * POST /api/inventory
 */
router.post('/', [
  verifyToken,
  requireAdmin,
  body('ingredient_name').notEmpty().withMessage('Ingredient name is required'),
  body('quantity').isFloat({ min: 0 }).withMessage('Valid quantity is required'),
  body('unit').notEmpty().withMessage('Unit is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { ingredient_name, quantity, unit, reorder_level, supplier_info } = req.body;
    
    // Check if ingredient already exists
    const existingItem = await Inventory.findOne({ ingredient_name });
    
    if (existingItem) {
      return res.status(400).json({ error: 'Ingredient already exists in inventory' });
    }
    
    const inventoryItem = new Inventory({
      ingredient_name,
      quantity: parseFloat(quantity),
      unit,
      reorder_level: reorder_level ? parseFloat(reorder_level) : null,
      supplier_info
    });
    
    const savedItem = await inventoryItem.save();
    
    res.status(201).json({ message: 'Inventory item added successfully', item: savedItem });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Update Inventory Item
 * PUT /api/inventory/:id
 */
router.put('/:id', [
  verifyToken,
  requireAdmin,
  body('quantity').optional().isFloat({ min: 0 }).withMessage('Valid quantity is required'),
  body('reorder_level').optional().isFloat({ min: 0 }).withMessage('Valid reorder level is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { ingredient_name, quantity, unit, reorder_level, supplier_info } = req.body;
    
    const updateData = {};
    if (ingredient_name !== undefined) updateData.ingredient_name = ingredient_name;
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity);
    if (unit !== undefined) updateData.unit = unit;
    if (reorder_level !== undefined) updateData.reorder_level = parseFloat(reorder_level);
    if (supplier_info !== undefined) updateData.supplier_info = supplier_info;
    
    const inventoryItem = await Inventory.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!inventoryItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json({ message: 'Inventory item updated successfully', item: inventoryItem });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Delete Inventory Item
 * DELETE /api/inventory/:id
 */
router.delete('/:id', [verifyToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    
    const inventoryItem = await Inventory.findByIdAndDelete(id);
    
    if (!inventoryItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Update Inventory Quantity
 * PUT /api/inventory/:id/quantity
 */
router.put('/:id/quantity', [
  verifyToken,
  requireAdmin,
  body('quantity').isFloat({ min: 0 }).withMessage('Valid quantity is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { quantity } = req.body;
    
    const inventoryItem = await Inventory.findByIdAndUpdate(
      id,
      { quantity: parseFloat(quantity), updated_at: new Date() },
      { new: true }
    );
    
    if (!inventoryItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json({ message: 'Inventory quantity updated successfully', item: inventoryItem });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Remove duplicate routes that appear later in the file

module.exports = router;