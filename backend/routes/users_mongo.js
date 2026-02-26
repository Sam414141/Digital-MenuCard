const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth_mongo');
const AuthUtils = require('../utils/authUtils');
const {
  User,
  UserPreference,
  DietaryRestriction,
  UserDietaryRestriction,
  FavoriteItem,
  Order,
  MenuItem
} = require('../db_mongo');

const router = express.Router();

/**
 * Get User Profile
 * GET /api/users/profile
 */
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user data
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        // Get user preferences
        const preferences = await UserPreference.findOne({ user_id: userId });

        // Get user dietary restrictions
        const userDietaryRestrictions = await UserDietaryRestriction.find({ user_id: userId })
            .populate('dietary_restriction_id', 'name');
        
        const dietaryRestrictionNames = userDietaryRestrictions.map(udr => 
            udr.dietary_restriction_id ? udr.dietary_restriction_id.name : ''
        ).filter(name => name !== '');

        // Get favorite items count
        const favoriteItemsCount = await FavoriteItem.countDocuments({ user_id: userId });

        // Get total orders count
        const totalOrders = await Order.countDocuments({ user_id: userId });

        res.json({
            status: 'success',
            data: {
                profile: {
                    id: user._id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone: user.phone,
                    dateOfBirth: user.date_of_birth,
                    role: user.role,
                    createdAt: user.createdAt,
                    lastLogin: user.last_login,
                    preferences: {
                        spiceLevel: preferences ? preferences.preferred_spice_level : 'medium',
                        cuisineTypes: preferences ? preferences.preferred_cuisine_types || [] : [],
                        notifications: preferences ? preferences.notification_preferences || {} : {},
                        defaultTableSize: preferences ? preferences.default_table_size : 2,
                        specialInstructions: preferences ? preferences.special_instructions : ''
                    },
                    dietaryRestrictions: dietaryRestrictionNames,
                    stats: {
                        favoriteItemsCount: favoriteItemsCount,
                        totalOrders: totalOrders
                    }
                }
            }
        });

    } catch (error) {
        console.error('Get profile error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve profile'
        });
    }
});

/**
 * Update User Profile
 * PUT /api/users/profile
 */
router.put('/profile', [
    verifyToken,
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date of birth')
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

        const userId = req.user.id;
        const { firstName, lastName, phone, dateOfBirth } = req.body;

        // Build update object dynamically
        const updateObj = {};
        
        if (firstName !== undefined) {
            updateObj.first_name = firstName;
        }
        if (lastName !== undefined) {
            updateObj.last_name = lastName;
        }
        if (phone !== undefined) {
            updateObj.phone = phone;
        }
        if (dateOfBirth !== undefined) {
            updateObj.date_of_birth = dateOfBirth;
        }

        if (Object.keys(updateObj).length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No fields to update'
            });
        }

        updateObj.updatedAt = new Date();

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateObj,
            { new: true, projection: { password_hash: 0 } } // Exclude password from response
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: updatedUser._id,
                    email: updatedUser.email,
                    firstName: updatedUser.first_name,
                    lastName: updatedUser.last_name,
                    phone: updatedUser.phone,
                    dateOfBirth: updatedUser.date_of_birth,
                    updatedAt: updatedUser.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Update profile error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update profile'
        });
    }
});

/**
 * Update User Preferences
 * PUT /api/users/preferences
 */
router.put('/preferences', [
    verifyToken,
    body('spiceLevel')
        .optional()
        .isIn(['none', 'mild', 'medium', 'hot', 'extra-hot'])
        .withMessage('Invalid spice level'),
    body('cuisineTypes')
        .optional()
        .isArray()
        .withMessage('Cuisine types must be an array'),
    body('defaultTableSize')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('Default table size must be between 1 and 20'),
    body('specialInstructions')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Special instructions must be less than 500 characters')
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

        const userId = req.user.id;
        const { spiceLevel, cuisineTypes, notifications, defaultTableSize, specialInstructions } = req.body;

        // Build update object dynamically
        const updateObj = {};
        
        if (spiceLevel !== undefined) {
            updateObj.preferred_spice_level = spiceLevel;
        }
        if (cuisineTypes !== undefined) {
            updateObj.preferred_cuisine_types = cuisineTypes;
        }
        if (notifications !== undefined) {
            updateObj.notification_preferences = notifications;
        }
        if (defaultTableSize !== undefined) {
            updateObj.default_table_size = defaultTableSize;
        }
        if (specialInstructions !== undefined) {
            updateObj.special_instructions = specialInstructions;
        }

        if (Object.keys(updateObj).length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No preferences to update'
            });
        }

        updateObj.updatedAt = new Date();

        // Upsert preferences
        const preferences = await UserPreference.findOneAndUpdate(
            { user_id: userId },
            { 
                user_id: userId,
                ...updateObj
            },
            { 
                new: true, 
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

        res.json({
            status: 'success',
            message: 'Preferences updated successfully',
            data: {
                preferences
            }
        });

    } catch (error) {
        console.error('Update preferences error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update preferences'
        });
    }
});

/**
 * Get Dietary Restrictions
 * GET /api/users/dietary-restrictions
 */
router.get('/dietary-restrictions', async (req, res) => {
    try {
        const dietaryRestrictions = await DietaryRestriction.find().sort({ name: 1 });

        res.json({
            status: 'success',
            data: {
                dietaryRestrictions
            }
        });

    } catch (error) {
        console.error('Get dietary restrictions error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve dietary restrictions'
        });
    }
});

/**
 * Update User Dietary Restrictions
 * PUT /api/users/dietary-restrictions
 */
router.put('/dietary-restrictions', [
    verifyToken,
    body('restrictionIds')
        .isArray()
        .withMessage('Restriction IDs must be an array')
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

        const userId = req.user.id;
        const { restrictionIds } = req.body;

        try {
            // Remove existing restrictions
            await User.findByIdAndUpdate(userId, { $set: { dietary_restrictions: restrictionIds } });
            
            res.json({
                status: 'success',
                message: 'Dietary restrictions updated successfully'
            });

        } catch (error) {
            throw error;
        }

    } catch (error) {
        console.error('Update dietary restrictions error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update dietary restrictions'
        });
    }
});

/**
 * Change Password
 * PUT /api/users/change-password
 */
router.put('/change-password', [
    verifyToken,
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
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

        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Validate new password strength
        const passwordValidation = AuthUtils.validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                status: 'error',
                message: passwordValidation.message,
                requirements: passwordValidation.requirements
            });
        }

        // Get current user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await AuthUtils.comparePassword(
            currentPassword, 
            user.password_hash
        );

        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                status: 'error',
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const newPasswordHash = await AuthUtils.hashPassword(newPassword);

        // Update password
        user.password_hash = newPasswordHash;
        user.updatedAt = new Date();
        await user.save();

        res.json({
            status: 'success',
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to change password'
        });
    }
});

/**
 * Get User Statistics and Dashboard Data
 * GET /api/users/stats
 */
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get comprehensive user statistics
        const totalOrders = await Order.countDocuments({ user_id: userId });
        const completedOrders = await Order.countDocuments({ user_id: userId, status: 'completed' });
        const cancelledOrders = await Order.countDocuments({ user_id: userId, status: 'cancelled' });
        
        // Calculate total spent and average order value
        const completedOrdersData = await Order.find({ user_id: userId, status: 'completed' });
        const totalSpent = completedOrdersData.reduce((sum, order) => sum + order.total_price, 0);
        const avgOrderValue = completedOrdersData.length > 0 ? totalSpent / completedOrdersData.length : 0;
        
        // Get favorite items count
        const favoriteItemsCount = await FavoriteItem.countDocuments({ user_id: userId });
        
        // Get unique days ordered
        const uniqueDays = [...new Set(completedOrdersData.map(order => 
            new Date(order.createdAt).toDateString()
        ))];
        const daysOrdered = uniqueDays.length;
        
        // Get recent orders (last 5)
        const recentOrders = await Order.find({ user_id: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        
        // Get favorite items
        const favoriteItems = await FavoriteItem.find({ user_id: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
                path: 'menu_item',
                select: 'name price image'
            })
            .lean();
        
        // Get monthly spending trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const spendingTrend = await Order.aggregate([
            {
                $match: {
                    user_id: userId,
                    status: 'completed',
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $project: {
                    month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    total_price: 1
                }
            },
            {
                $group: {
                    _id: "$month",
                    total_spent: { $sum: "$total_price" },
                    order_count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: -1 }
            },
            {
                $limit: 6
            }
        ]);

        res.json({
            status: 'success',
            data: {
                stats: {
                    totalOrders: totalOrders,
                    completedOrders: completedOrders,
                    cancelledOrders: cancelledOrders,
                    totalSpent: totalSpent,
                    avgOrderValue: avgOrderValue,
                    favoriteItemsCount: favoriteItemsCount,
                    daysOrdered: daysOrdered
                },
                recentOrders: recentOrders.map(order => ({
                    id: order._id,
                    totalPrice: order.total_price,
                    status: order.status,
                    createdAt: order.createdAt,
                    itemCount: order.items ? order.items.length : 0
                })),
                favoriteItems: favoriteItems.map(item => ({
                    id: item._id,
                    menuItemId: item.menu_item ? item.menu_item._id : null,
                    name: item.menu_item ? item.menu_item.name : null,
                    price: item.menu_item ? item.menu_item.price : null,
                    image: item.menu_item ? item.menu_item.image : null,
                    customizations: item.customizations,
                    createdAt: item.createdAt
                })),
                spendingTrend: spendingTrend.map(month => ({
                    month: month._id,
                    totalSpent: month.total_spent,
                    orderCount: month.order_count
                }))
            }
        });
        
    } catch (error) {
        console.error('Get user stats error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve user statistics'
        });
    }
});

module.exports = router;