const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { verifyToken, requireAdmin } = require('../middleware/auth_mongo');
const {
  Category,
  MenuItem,
  DietaryRestriction,
  User,
  UserPreference,
  Order,
  OrderItem
} = require('../db_mongo');

// Get all menu items with dietary information
router.get('/', async (req, res) => {
  try {
    const { category, dietary_filter, search } = req.query;
    
    // Build query
    let query = { is_available: true };
    
    if (category) {
      query.category_id = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Populate category information
    let menuItems = await MenuItem.find(query).populate('category_id', 'name');
    
    // Populate dietary restrictions
    menuItems = await MenuItem.populate(menuItems, { 
      path: 'dietary_restrictions', 
      select: 'name' 
    });
    
    // Convert to plain objects for manipulation
    menuItems = menuItems.map(item => item.toObject());
    
    // Format dietary restrictions
    menuItems = menuItems.map(item => {
      return {
        ...item,
        id: item._id,
        category_name: item.category_id ? item.category_id.name : null,
        dietary_restrictions: item.dietary_restrictions ? 
          item.dietary_restrictions.map(dr => dr.name) : [],
        category_id: item.category_id ? item.category_id._id : null
      };
    });
    
    // Filter by dietary restrictions if specified
    if (dietary_filter) {
      const dietaryFilters = dietary_filter.split(',');
      menuItems = menuItems.filter(item => {
        if (!item.dietary_restrictions || item.dietary_restrictions.length === 0) {
          return false;
        }
        return dietaryFilters.every(filter => 
          item.dietary_restrictions.includes(filter)
        );
      });
    }
    
    res.json({
      status: 'success',
      data: menuItems,
      message: 'Menu items retrieved successfully'
    });
  } catch (err) {
    console.error('Menu route error:', err);
    res.status(500).json({ 
      status: 'error',
      error: 'Internal Server Error',
      message: err.message,
      stack: err.stack
    });
  }
});

// Get menu with categories (enhanced)
router.get('/with-categories', async (req, res) => {
  try {
    // Get all categories
    const categories = await Category.find().sort({ _id: 1 });
    
    // Get all menu items with dietary restrictions populated
    const menuItems = await MenuItem.find({ is_available: true })
      .populate('category_id', 'name')
      .populate('dietary_restrictions', 'name');
    
    // Group menu items by category
    const menu = categories.map(category => {
      const categoryItems = menuItems
        .filter(item => item.category_id && item.category_id._id.toString() === category._id.toString())
        .map(item => ({
          id: item._id,
          name: item.name,
          image: item.image,
          description: item.description,
          price: item.price,
          calories: item.calories,
          preparation_time: item.preparation_time,
          allergens: item.allergens,
          dietary_restrictions: item.dietary_restrictions ? 
            item.dietary_restrictions.map(dr => dr.name) : [],
          is_available: item.is_available
        }));
      
      return {
        category: category.name,
        category_id: category._id,
        items: categoryItems
      };
    });
    
    res.json({
      status: 'success',
      data: menu,
      message: 'Menu retrieved successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      status: 'error',
      error: 'Internal Server Error',
      message: err.message 
    });
  }
});

// Get all menu categories - ADMIN ENDPOINT
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    // Return as array with id and name
    const categoryList = categories.map(cat => ({
      _id: cat._id,
      id: cat._id,
      name: cat.name,
      description: cat.description
    }));
    
    res.json({
      status: 'success',
      data: categoryList,
      message: 'Categories retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ 
      status: 'error',
      error: 'Internal Server Error',
      message: err.message 
    });
  }
});

// Get menu items filtered by user's dietary restrictions
router.get('/filtered/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { category, search } = req.query;
    
    // Get user's dietary restrictions
    const userDietaryRestrictions = await User.findById(user_id)
      .populate({
        path: 'dietary_restrictions',
        select: 'name'
      });
    
    if (!userDietaryRestrictions) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userRestrictionNames = userDietaryRestrictions.dietary_restrictions 
      ? userDietaryRestrictions.dietary_restrictions.map(dr => dr.name) 
      : [];
    
    // Build query
    let query = { is_available: true };
    
    if (category) {
      query.category_id = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get menu items
    let menuItems = await MenuItem.find(query)
      .populate('category_id', 'name')
      .populate('dietary_restrictions', 'name');
    
    // Format and add suitability flag
    menuItems = menuItems.map(item => {
      const itemRestrictions = item.dietary_restrictions 
        ? item.dietary_restrictions.map(dr => dr.name) 
        : [];
      
      const suitable_for_user = userRestrictionNames.every(
        restriction => itemRestrictions.includes(restriction)
      );
      
      return {
        ...item.toObject(),
        category_name: item.category_id ? item.category_id.name : null,
        dietary_restrictions: itemRestrictions,
        suitable_for_user,
        category_id: item.category_id ? item.category_id._id : null
      };
    });
    
    // Sort by suitability first, then by category and name
    menuItems.sort((a, b) => {
      if (a.suitable_for_user !== b.suitable_for_user) {
        return b.suitable_for_user - a.suitable_for_user; // Suitable items first
      }
      if (a.category_id && b.category_id) {
        return a.category_id.toString().localeCompare(b.category_id.toString());
      }
      return a.name.localeCompare(b.name);
    });
    
    res.json(menuItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Get item recommendations based on user preferences
router.get('/recommendations/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Get user preferences
    const userPrefs = await UserPreference.findOne({ user_id: user_id });
    
    // Get user's favorite/order history
    const orderHistory = await Order.aggregate([
      { $match: { user_id: user_id } },
      { $lookup: {
        from: 'orderitems',
        localField: '_id',
        foreignField: 'order_id',
        as: 'items'
      }},
      { $unwind: '$items' },
      { $group: {
        _id: '$items.item_name',
        order_count: { $sum: 1 }
      }},
      { $sort: { order_count: -1 } },
      { $limit: 5 }
    ]);
    
    // Get popular items from similar users (simplified approach)
    const userOrders = await Order.find({ user_id: user_id });
    const orderedItems = userOrders.flatMap(order => 
      order.items ? order.items.map(item => item.item_name) : []
    );
    
    // Find other users who ordered similar items
    const similarUsers = await Order.find({
      'items.item_name': { $in: orderedItems },
      user_id: { $ne: user_id }
    }).distinct('user_id');
    
    // Get popular items among similar users
    const recommendations = await Order.aggregate([
      { $match: { user_id: { $in: similarUsers } } },
      { $lookup: {
        from: 'orderitems',
        localField: '_id',
        foreignField: 'order_id',
        as: 'items'
      }},
      { $unwind: '$items' },
      { $group: {
        _id: '$items.item_name',
        popularity_score: { $sum: 1 }
      }},
      { $sort: { popularity_score: -1 } },
      { $limit: 10 },
      { $lookup: {
        from: 'menuitems',
        localField: '_id',
        foreignField: 'name',
        as: 'menu_item'
      }},
      { $unwind: { path: '$menu_item', preserveNullAndEmptyArrays: true } },
      { $match: { 'menu_item.is_available': true } },
      { $replaceRoot: {
        newRoot: {
          $mergeObjects: ['$menu_item', { popularity_score: '$popularity_score' }]
        }
      }}
    ]);
    
    res.json({
      user_preferences: userPrefs || null,
      favorite_items: orderHistory,
      recommended_items: recommendations
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add/Update menu item - ADMIN ONLY
// Enhanced CREATE endpoint with authentication and validation
router.post('/', [
  verifyToken, 
  requireAdmin,
  body('name').notEmpty().trim().withMessage('Item name is required'),
  body('category_id').notEmpty().withMessage('Valid category ID is required'),
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Price must be a number greater than 0 in INR')
    .custom(value => {
      // Ensure price is treated as INR (no symbol validation needed, just numeric)
      if (isNaN(parseFloat(value))) {
        throw new Error('Invalid price format');
      }
      return true;
    }),
  body('description').optional().isString(),
  body('calories').optional().isNumeric(),
  body('preparation_time').optional().isNumeric(),
  body('allergens').optional().isArray(),
  body('dietary_restrictions').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error',
        errors: errors.array(),
        message: 'Validation failed'
      });
    }
    
    const { 
      name, category_id, price, description, image, 
      calories, preparation_time, allergens, dietary_restrictions, is_available
    } = req.body;
    
    // Verify category exists
    const categoryExists = await Category.findById(category_id);
    if (!categoryExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid category ID'
      });
    }
    
    // Verify dietary restrictions exist if provided
    if (dietary_restrictions && dietary_restrictions.length > 0) {
      const restrictionsExist = await DietaryRestriction.countDocuments({
        _id: { $in: dietary_restrictions }
      });
      if (restrictionsExist !== dietary_restrictions.length) {
        return res.status(400).json({
          status: 'error',
          message: 'One or more dietary restrictions do not exist'
        });
      }
    }
    
    // Create menu item
    const menuItem = new MenuItem({
      name: name.trim(),
      category_id,
      price: parseFloat(price), // Ensure price is stored as number (in INR)
      description: description ? description.trim() : '',
      image: image || null,
      calories: calories ? parseFloat(calories) : null,
      preparation_time: preparation_time ? parseInt(preparation_time) : null,
      allergens: allergens || [],
      is_available: is_available !== undefined ? is_available : true,
      dietary_restrictions: dietary_restrictions || []
    });
    
    const savedItem = await menuItem.save();
    
    // Populate category and dietary restrictions for response
    await savedItem.populate('category_id', 'name');
    await savedItem.populate('dietary_restrictions', 'name');
    
    res.status(201).json({ 
      status: 'success',
      message: 'Menu item created successfully',
      data: {
        id: savedItem._id,
        name: savedItem.name,
        category_id: savedItem.category_id._id,
        category_name: savedItem.category_id.name,
        price: savedItem.price,
        description: savedItem.description,
        image: savedItem.image,
        calories: savedItem.calories,
        preparation_time: savedItem.preparation_time,
        allergens: savedItem.allergens,
        is_available: savedItem.is_available,
        dietary_restrictions: savedItem.dietary_restrictions.map(dr => dr.name),
        created_at: savedItem.createdAt
      }
    });
  } catch (err) {
    console.error('Menu create error:', err);
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to create menu item',
      message: err.message
    });
  }
});

// UPDATE menu item - ADMIN ONLY
router.put('/:id', [
  verifyToken,
  requireAdmin,
  body('name').optional().trim().notEmpty().withMessage('Item name cannot be empty'),
  body('category_id').optional(),
  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price must be a number greater than 0 in INR'),
  body('description').optional(),
  body('calories').optional(),
  body('preparation_time').optional(),
  body('allergens').optional().isArray(),
  body('dietary_restrictions').optional().isArray(),
  body('is_available').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array(),
        message: 'Validation failed'
      });
    }
    
    const { id } = req.params;
    const updateData = {};
    
    // Build update object with only provided fields
    if (req.body.name !== undefined) {
      updateData.name = req.body.name.trim();
    }
    if (req.body.category_id !== undefined) {
      // Verify category exists
      const categoryExists = await Category.findById(req.body.category_id);
      if (!categoryExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid category ID'
        });
      }
      updateData.category_id = req.body.category_id;
    }
    if (req.body.price !== undefined) {
      updateData.price = parseFloat(req.body.price);
    }
    if (req.body.description !== undefined) {
      updateData.description = req.body.description ? req.body.description.trim() : '';
    }
    if (req.body.image !== undefined) {
      updateData.image = req.body.image || null;
    }
    if (req.body.calories !== undefined) {
      updateData.calories = req.body.calories ? parseFloat(req.body.calories) : null;
    }
    if (req.body.preparation_time !== undefined) {
      updateData.preparation_time = req.body.preparation_time ? parseInt(req.body.preparation_time) : null;
    }
    if (req.body.allergens !== undefined) {
      updateData.allergens = req.body.allergens;
    }
    if (req.body.dietary_restrictions !== undefined) {
      // Verify dietary restrictions exist if provided
      if (req.body.dietary_restrictions.length > 0) {
        const restrictionsExist = await DietaryRestriction.countDocuments({
          _id: { $in: req.body.dietary_restrictions }
        });
        if (restrictionsExist !== req.body.dietary_restrictions.length) {
          return res.status(400).json({
            status: 'error',
            message: 'One or more dietary restrictions do not exist'
          });
        }
      }
      updateData.dietary_restrictions = req.body.dietary_restrictions;
    }
    if (req.body.is_available !== undefined) {
      updateData.is_available = req.body.is_available;
    }
    
    updateData.updatedAt = new Date();
    
    const menuItem = await MenuItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category_id', 'name')
     .populate('dietary_restrictions', 'name');
    
    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu item not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Menu item updated successfully',
      data: {
        id: menuItem._id,
        name: menuItem.name,
        category_id: menuItem.category_id._id,
        category_name: menuItem.category_id.name,
        price: menuItem.price,
        description: menuItem.description,
        image: menuItem.image,
        calories: menuItem.calories,
        preparation_time: menuItem.preparation_time,
        allergens: menuItem.allergens,
        is_available: menuItem.is_available,
        dietary_restrictions: menuItem.dietary_restrictions.map(dr => dr.name),
        updated_at: menuItem.updatedAt
      }
    });
  } catch (err) {
    console.error('Menu update error:', err);
    res.status(500).json({
      status: 'error',
      error: 'Failed to update menu item',
      message: err.message
    });
  }
});

// DELETE menu item - ADMIN ONLY
router.delete('/:id', [verifyToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if menu item exists
    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu item not found'
      });
    }
    
    // Check if item is referenced in any orders
    const ordersWithItem = await OrderItem.countDocuments({
      item_name: menuItem.name
    });
    
    if (ordersWithItem > 0) {
      // Soft delete: just mark as unavailable
      menuItem.is_available = false;
      await menuItem.save();
      
      return res.json({
        status: 'success',
        message: `Menu item marked as unavailable (soft delete) - it is still referenced in ${ordersWithItem} orders`,
        data: {
          id: menuItem._id,
          name: menuItem.name,
          is_available: menuItem.is_available,
          message: 'Soft delete performed to preserve order history'
        }
      });
    }
    
    // Hard delete if not referenced in any orders
    await MenuItem.findByIdAndDelete(id);
    
    res.json({
      status: 'success',
      message: 'Menu item deleted successfully',
      data: {
        id: id,
        name: menuItem.name
      }
    });
  } catch (err) {
    console.error('Menu delete error:', err);
    res.status(500).json({
      status: 'error',
      error: 'Failed to delete menu item',
      message: err.message
    });
  }
});

// Update menu item availability - ADMIN ONLY
router.put('/:id/availability', [
  verifyToken,
  requireAdmin,
  body('is_available').isBoolean().withMessage('is_available must be boolean'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { is_available } = req.body;
    
    const menuItem = await MenuItem.findByIdAndUpdate(
      id, 
      { is_available },
      { new: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({ message: 'Menu item availability updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Toggle menu item status (active/inactive) - ADMIN ONLY - PATCH endpoint
router.patch('/:id/status', [
  verifyToken,
  requireAdmin,
  body('isActive').isBoolean().withMessage('isActive must be boolean'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'error',
        errors: errors.array() 
      });
    }
    
    const { id } = req.params;
    const { isActive } = req.body;
    
    const menuItem = await MenuItem.findByIdAndUpdate(
      id, 
      { is_available: isActive },
      { new: true }
    ).populate('category_id', 'name')
     .populate('dietary_restrictions', 'name');
    
    if (!menuItem) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Menu item not found' 
      });
    }
    
    res.json({
      status: 'success',
      data: menuItem,
      message: 'Menu item status updated successfully'
    });
  } catch (err) {
    console.error('Error updating menu item status:', err.message);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal Server Error',
      error: err.message 
    });
  }
});

// Get dietary restrictions
router.get('/dietary-restrictions', async (req, res) => {
  try {
    const dietaryRestrictions = await DietaryRestriction.find().sort({ name: 1 });
    res.json(dietaryRestrictions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add new dietary restriction
router.post('/dietary-restrictions', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, description } = req.body;
    
    const dietaryRestriction = new DietaryRestriction({
      name,
      description
    });
    
    const savedRestriction = await dietaryRestriction.save();
    
    res.status(201).json({ 
      message: 'Dietary restriction created successfully', 
      id: savedRestriction._id 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update menu item allergens - ADMIN ONLY
router.put('/:id/allergens', [verifyToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const { allergens } = req.body;
    
    const menuItem = await MenuItem.findByIdAndUpdate(
      id,
      { allergens, updated_at: new Date() },
      { new: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({ 
        status: 'error',
        error: 'Menu item not found' 
      });
    }
    
    res.json({ 
      status: 'success',
      message: 'Allergens updated successfully',
      data: {
        id: menuItem._id,
        allergens: menuItem.allergens
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      status: 'error',
      error: 'Internal Server Error',
      message: err.message
    });
  }
});

// Update menu item dietary restrictions - ADMIN ONLY
router.put('/:id/dietary-restrictions', [verifyToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const { restrictionIds } = req.body;
    
    // Verify dietary restrictions exist if provided
    if (restrictionIds && restrictionIds.length > 0) {
      const restrictionsExist = await DietaryRestriction.countDocuments({
        _id: { $in: restrictionIds }
      });
      if (restrictionsExist !== restrictionIds.length) {
        return res.status(400).json({
          status: 'error',
          message: 'One or more dietary restrictions do not exist'
        });
      }
    }
    
    const menuItem = await MenuItem.findByIdAndUpdate(
      id,
      { dietary_restrictions: restrictionIds || [] },
      { new: true }
    ).populate('dietary_restrictions', 'name');
    
    if (!menuItem) {
      return res.status(404).json({
        status: 'error',
        error: 'Menu item not found' 
      });
    }
    
    res.json({ 
      status: 'success',
      message: 'Dietary restrictions updated successfully',
      data: {
        id: menuItem._id,
        dietary_restrictions: menuItem.dietary_restrictions.map(dr => dr.name)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      status: 'error',
      error: 'Internal Server Error',
      message: err.message
    });
  }
});

module.exports = router;