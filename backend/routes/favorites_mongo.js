const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth_mongo');
const {
  FavoriteItem,
  MenuItem
} = require('../db_mongo');

/**
 * Get User's Favorite Items
 * GET /api/favorites
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const favorites = await FavoriteItem.find({ user_id: userId })
      .sort({ createdAt: -1 });
    
    // For each favorite, fetch the corresponding menu item
    const favoritesWithMenuItems = [];
    for (const fav of favorites) {
      // Try to find menu item by MongoDB ObjectId first
      let menuItem;
      if (mongoose.Types.ObjectId.isValid(fav.menu_item_id)) {
        menuItem = await MenuItem.findById(fav.menu_item_id);
      }
      
      // If not found by ObjectId, try to find by numeric id field
      if (!menuItem) {
        menuItem = await MenuItem.findOne({ id: parseInt(fav.menu_item_id) });
      }
      
      favoritesWithMenuItems.push({
        id: fav._id,
        menuItemId: fav.menu_item_id,
        customizations: fav.customizations,
        createdAt: fav.createdAt,
        menuItem: menuItem ? menuItem.toObject() : null
      });
    }
    
    res.json({
      status: 'success',
      data: {
        favorites: favoritesWithMenuItems
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Add Item to Favorites
 * POST /api/favorites
 */
router.post('/', [
  verifyToken,
  body('menuItemId').notEmpty().withMessage('Menu item ID is required'),
  body('customizations').optional().isString().withMessage('Customizations must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user.id;
    const { menuItemId, customizations } = req.body;
    
    // Check if item already exists in favorites
    const existingFavorite = await FavoriteItem.findOne({
      user_id: userId,
      menu_item_id: menuItemId
    });
    
    if (existingFavorite) {
      return res.status(409).json({ 
        status: 'error',
        message: 'Item already in favorites' 
      });
    }
    
    const favoriteItem = new FavoriteItem({
      user_id: userId,
      menu_item_id: menuItemId,
      customizations: customizations || ''
    });
    
    const savedFavorite = await favoriteItem.save();
    
    // Fetch the corresponding menu item
    // Try to find menu item by MongoDB ObjectId first
    let menuItem;
    if (mongoose.Types.ObjectId.isValid(savedFavorite.menu_item_id)) {
      menuItem = await MenuItem.findById(savedFavorite.menu_item_id);
    }
    
    // If not found by ObjectId, try to find by numeric id field
    if (!menuItem) {
      menuItem = await MenuItem.findOne({ id: parseInt(savedFavorite.menu_item_id) });
    }

    res.status(201).json({
      status: 'success',
      message: 'Item added to favorites',
      data: {
        favorite: {
          id: savedFavorite._id,
          menuItemId: savedFavorite.menu_item_id,
          customizations: savedFavorite.customizations,
          createdAt: savedFavorite.createdAt,
          menuItem: menuItem ? menuItem.toObject() : null
        }
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Remove Item from Favorites
 * DELETE /api/favorites/:id
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const favorite = await FavoriteItem.findOneAndDelete({
      _id: id,
      user_id: userId
    });
    
    if (!favorite) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Favorite item not found' 
      });
    }
    
    res.json({
      status: 'success',
      message: 'Item removed from favorites'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Clear All Favorites
 * DELETE /api/favorites
 */
router.delete('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await FavoriteItem.deleteMany({ user_id: userId });
    
    res.json({
      status: 'success',
      message: 'All favorites cleared'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;