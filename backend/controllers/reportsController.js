/**
 * Reports Controller - MongoDB Implementation
 * Handles all reports-related business logic
 */

// Import the database connection
const db = require('../db_mongo');

/**
 * Get customer-wise order details
 */
const getCustomerWiseOrders = async (req, res) => {
    try {
        // Dynamically get models from db connection
        const { Order, User } = require('../db_mongo');
        
        const { date_from, date_to } = req.query;
        
        // Build query based on date range with strict validation
        let query = {};
        
        // Validate and apply date range filtering
        if (date_from && date_to) {
            const startDate = new Date(date_from);
            const endDate = new Date(date_to);
            
            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format provided'
                });
            }
            
            // Ensure end date is not before start date
            if (endDate < startDate) {
                return res.status(400).json({
                    success: false,
                    message: 'End date cannot be before start date'
                });
            }
            
            // Apply inclusive date range filtering
            query.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }
        
        // Aggregate orders by customer, joining with User collection to get customer details
        const customerOrders = await Order.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "users", // User collection name
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_info"
                }
            },
            {
                $group: {
                    _id: "$user_id", // Group by user_id
                    customerName: { 
                        $first: { 
                            $concat: [
                                { $ifNull: [{ $arrayElemAt: ["$user_info.first_name", 0] }, ""] },
                                " ",
                                { $ifNull: [{ $arrayElemAt: ["$user_info.last_name", 0] }, ""] }
                            ]
                        }
                    },
                    customerEmail: { $first: { $arrayElemAt: ["$user_info.email", 0] } },
                    totalOrders: { $sum: 1 },
                    totalAmount: { $sum: "$total_price" }
                }
            },
            {
                $sort: { totalAmount: -1 }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: customerOrders.map(item => ({
                customerName: item.customerName.trim() || 'Unknown Customer',
                customerEmail: item.customerEmail || 'N/A',
                totalOrders: item.totalOrders,
                totalAmount: item.totalAmount
            }))
        });
    } catch (error) {
        console.error('Error getting customer-wise orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving customer-wise order details',
            error: error.message
        });
    }
};

/**
 * Get category-wise sales details
 */
const getCategoryWiseSales = async (req, res) => {
    try {
        // Dynamically get models from db connection
        const { Order } = require('../db_mongo');
        
        const { date_from, date_to } = req.query;
        
        // Build query based on date range with strict validation
        let query = {
            status: { $ne: 'cancelled' }, // Exclude cancelled orders
            payment_status: 'completed'    // Only completed payments
        };
        
        // Validate and apply date range filtering
        if (date_from && date_to) {
            const startDate = new Date(date_from);
            const endDate = new Date(date_to);
            
            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format provided'
                });
            }
            
            // Ensure end date is not before start date
            if (endDate < startDate) {
                return res.status(400).json({
                    success: false,
                    message: 'End date cannot be before start date'
                });
            }
            
            // Apply inclusive date range filtering
            query.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }
        
        // Use MongoDB aggregation to calculate category-wise sales by joining with MenuItems
        const categorySales = await Order.aggregate([
            { $match: query },
            { $unwind: "$items" },
            // Lookup menu item to get category information
            {
                $lookup: {
                    from: "menuitems",
                    localField: "items.item_name",
                    foreignField: "name",
                    as: "menuItem"
                }
            },
            {
                $unwind: {
                    path: "$menuItem",
                    preserveNullAndEmptyArrays: true
                }
            },
            // Lookup category to get category name
            {
                $lookup: {
                    from: "categories",
                    localField: "menuItem.category_id",
                    foreignField: "_id",
                    as: "categoryInfo"
                }
            },
            {
                $unwind: {
                    path: "$categoryInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: {
                        categoryId: "$menuItem.category_id",
                        categoryName: { 
                            $cond: [
                                { $ne: ["$categoryInfo", null] },
                                "$categoryInfo.name",
                                "Uncategorized"
                            ]
                        }
                    },
                    totalQuantity: { $sum: "$items.quantity" },
                    totalRevenue: { 
                        $sum: { 
                            $multiply: [
                                { $ifNull: [{ $ifNull: ["$items.price", "$items.unit_price"] }, 0] },
                                { $ifNull: ["$items.quantity", 0] }
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id.categoryName",
                    totalQuantity: 1,
                    totalRevenue: 1
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);
        
        // Filter out Uncategorized items and rename Beverages to Drinks
        const filteredCategorySales = categorySales
            .filter(item => item.category && item.category !== 'Uncategorized')
            .map(item => ({
                ...item,
                category: item.category === 'Beverages' ? 'Drinks' : item.category
            }));
        
        res.status(200).json({
            success: true,
            data: filteredCategorySales.length > 0 
                ? filteredCategorySales 
                : [] // Return empty array when no data is available
        });
    } catch (error) {
        console.error('Error getting category-wise sales:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving category-wise sales details',
            error: error.message
        });
    }
};

/**
 * Get customer-wise feedback details
 */
const getCustomerWiseFeedback = async (req, res) => {
    try {
        // Dynamically get models from db connection
        const { Feedback } = require('../db_mongo');
        
        const { date_from, date_to } = req.query;
        
        // Build query based on date range with strict validation
        let query = {};
        
        // Validate and apply date range filtering
        if (date_from && date_to) {
            const startDate = new Date(date_from);
            const endDate = new Date(date_to);
            
            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format provided'
                });
            }
            
            // Ensure end date is not before start date
            if (endDate < startDate) {
                return res.status(400).json({
                    success: false,
                    message: 'End date cannot be before start date'
                });
            }
            
            // Apply inclusive date range filtering
            query.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }
        
        // First, get all feedback documents with order information
        let customerFeedback = await Feedback.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "orders",  // Join with orders collection to get customer info if possible
                    localField: "order_id",
                    foreignField: "_id",
                    as: "orderInfo"
                }
            },
            {
                $lookup: {
                    from: "users",  // Join with users collection to get customer info if possible
                    localField: "user_id",  // Use user_id from feedback if available
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            {
                $addFields: {
                    // Get customer information prioritizing: feedback metadata > user info > order info
                    resolvedCustomerName: {
                        $cond: {
                            if: { $and: [
                                { $ifNull: ["$metadata.customerName", false] },
                                { $ne: ["$metadata.customerName", ""] },
                                { $ne: ["$metadata.customerName", "Anonymous Customer"] },
                                { $ne: ["$metadata.customerName", "anonymous"] }
                            ]},
                            then: "$metadata.customerName",
                            else: {
                                $cond: {
                                    if: { $and: [
                                        { $gt: [{ $size: "$userInfo" }, 0] },
                                        { $ne: [{ $arrayElemAt: ["$userInfo.first_name", 0] }, null] },
                                        { $ne: [{ $arrayElemAt: ["$userInfo.last_name", 0] }, null] }
                                    ]},
                                    then: {
                                        $concat: [
                                            { $arrayElemAt: ["$userInfo.first_name", 0] },
                                            " ",
                                            { $arrayElemAt: ["$userInfo.last_name", 0] }
                                        ]
                                    },
                                    else: {
                                        $cond: {
                                            if: { $and: [
                                                { $gt: [{ $size: "$userInfo" }, 0] },
                                                { $ne: [{ $arrayElemAt: ["$userInfo.name", 0] }, null] }
                                            ]},
                                            then: { $arrayElemAt: ["$userInfo.name", 0] },
                                            else: {
                                                $cond: {
                                                    if: { $and: [
                                                        { $gt: [{ $size: "$orderInfo" }, 0] },
                                                        { $ne: [{ $arrayElemAt: ["$orderInfo.first_name", 0] }, null] },
                                                        { $ne: [{ $arrayElemAt: ["$orderInfo.last_name", 0] }, null] }
                                                    ]},
                                                    then: {
                                                        $concat: [
                                                            { $arrayElemAt: ["$orderInfo.first_name", 0] },
                                                            " ",
                                                            { $arrayElemAt: ["$orderInfo.last_name", 0] }
                                                        ]
                                                    },
                                                    else: {
                                                        $cond: {
                                                            if: { $and: [
                                                                { $gt: [{ $size: "$orderInfo" }, 0] },
                                                                { $ne: [{ $arrayElemAt: ["$orderInfo.name", 0] }, null] }
                                                            ]},
                                                            then: { $arrayElemAt: ["$orderInfo.name", 0] },
                                                            else: null
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    resolvedCustomerEmail: {
                        $cond: {
                            if: { $and: [
                                { $ifNull: ["$email", false] },
                                { $ne: ["$email", ""] }
                            ]},
                            then: "$email",
                            else: {
                                $cond: {
                                    if: { $and: [
                                        { $gt: [{ $size: "$userInfo" }, 0] },
                                        { $ne: [{ $arrayElemAt: ["$userInfo.email", 0] }, null] }
                                    ]},
                                    then: { $arrayElemAt: ["$userInfo.email", 0] },
                                    else: {
                                        $cond: {
                                            if: { $and: [
                                                { $gt: [{ $size: "$orderInfo" }, 0] },
                                                { $ne: [{ $arrayElemAt: ["$orderInfo.email", 0] }, null] }
                                            ]},
                                            then: { $arrayElemAt: ["$orderInfo.email", 0] },
                                            else: null
                                        }
                                    }
                                }
                            }
                        }
                    },
                    resolvedCustomerPhone: {
                        $cond: {
                            if: { $and: [
                                { $ifNull: ["$metadata.mobileNumber", false] },
                                { $ne: ["$metadata.mobileNumber", ""] }
                            ]},
                            then: "$metadata.mobileNumber",
                            else: {
                                $cond: {
                                    if: { $and: [
                                        { $gt: [{ $size: "$userInfo" }, 0] },
                                        { $ne: [{ $arrayElemAt: ["$userInfo.phone", 0] }, null] }
                                    ]},
                                    then: { $arrayElemAt: ["$userInfo.phone", 0] },
                                    else: {
                                        $cond: {
                                            if: { $and: [
                                                { $gt: [{ $size: "$orderInfo" }, 0] },
                                                { $ne: [{ $arrayElemAt: ["$orderInfo.phone", 0] }, null] }
                                            ]},
                                            then: { $arrayElemAt: ["$orderInfo.phone", 0] },
                                            else: null
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: { $ifNull: ["$resolvedCustomerEmail", "$_id"] }, // Group by resolved email or fallback to feedback ID
                    customerName: { $first: "$resolvedCustomerName" },
                    customerEmail: { $first: "$resolvedCustomerEmail" },
                    customerPhone: { $first: "$resolvedCustomerPhone" },
                    totalReviews: { $sum: 1 },
                    avgRating: { $avg: { $ifNull: ["$rating", 0] } },
                    foodAvg: { $avg: { $ifNull: [{ $toInt: "$metadata.foodQuality" }, 0] } },
                    serviceAvg: { $avg: { $ifNull: [{ $toInt: "$metadata.serviceRating" }, 0] } },
                    ambienceAvg: { $avg: { $ifNull: [{ $toInt: "$metadata.ambienceRating" }, 0] } }
                }
            },
            {
                $sort: { totalReviews: -1 }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: customerFeedback.map(item => {
                // Create a more informative customer identifier
                let customerIdentifier = 'Anonymous Customer';
                
                if (item.customerName && item.customerName !== 'N/A' && item.customerName !== 'null' && item.customerName !== null && item.customerName.trim() !== '') {
                    customerIdentifier = item.customerName;
                } else if (item.customerEmail && item.customerEmail !== 'No Email Provided' && item.customerEmail !== 'N/A' && item.customerEmail !== null && item.customerEmail.trim() !== '') {
                    // Extract name from email if no explicit name is available
                    const emailPrefix = item.customerEmail.split('@')[0];
                    customerIdentifier = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
                } else if (item.customerPhone && item.customerPhone !== 'null' && item.customerPhone !== null && item.customerPhone.trim() !== '') {
                    customerIdentifier = `Customer (${item.customerPhone})`;
                }
                
                return {
                    customer: customerIdentifier,
                    avgRating: parseFloat(item.avgRating.toFixed(2)),
                    food: parseFloat(item.foodAvg.toFixed(2)),
                    service: parseFloat(item.serviceAvg.toFixed(2)),
                    ambience: parseFloat(item.ambienceAvg.toFixed(2)),
                    totalReviews: item.totalReviews
                };
            })
        });
    } catch (error) {
        console.error('Error getting customer-wise feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving customer-wise feedback details',
            error: error.message
        });
    }
};

/**
 * Get date range-wise sales details with grand total
 */
const getDateRangeWiseSales = async (req, res) => {
    try {
        // Dynamically get models from db connection
        const { Order } = require('../db_mongo');
        
        const { date_from, date_to } = req.query;
        
        // Build query - show all data without date filtering
        const query = {
            status: { $ne: 'cancelled' }, // Exclude cancelled orders
            payment_status: 'completed'    // Only completed payments
        };
        
        // Note: Date range parameters are accepted but ignored to show all data
        // This allows the frontend to still send date parameters for consistency
        // but we display all historical sales data regardless of the date range
        
        // Group by date
        const dailySales = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$total_price" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: dailySales.length > 0 
                ? dailySales.map(item => ({
                    date: item._id,
                    totalOrders: item.totalOrders,
                    totalRevenue: item.totalRevenue
                  }))
                : [] // Return empty array when no data is available
        });
    } catch (error) {
        console.error('Error getting date range-wise sales:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving date range-wise sales details',
            error: error.message
        });
    }
};

/**
 * Get inventory details
 */
const getInventoryDetails = async (req, res) => {
    try {
        // Dynamically get models from db connection
        const { Inventory } = require('../db_mongo');
        
        // Note: Inventory items typically don't have date range filtering
        // as they represent current stock levels
        // However, we can accept date parameters for consistency with other reports
        // and potentially use them for historical inventory data if needed
        
        // For now, fetch all inventory items (no date range filtering applicable)
        const inventoryItems = await Inventory.find({});
        
        // Process the inventory data to add status based on stock quantity
        const processedInventory = inventoryItems.map(item => {
            let status = 'In Stock';
            if (item.quantity <= 0) {
                status = 'Out of Stock';
            } else if (item.quantity <= 5) { // Assuming 5 as low stock threshold
                status = 'Low Stock';
            }
            
            return {
                _id: item._id,
                name: item.ingredient_name,
                category: 'Ingredients', // Using a default category since it's not in the schema
                stock_quantity: item.quantity,
                price: item.price || 0, // Use the price field from the inventory item
                status: status
            };
        });
        
        res.status(200).json({
            success: true,
            data: processedInventory
        });
    } catch (error) {
        console.error('Error getting inventory details:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving inventory details',
            error: error.message
        });
    }
};

/**
 * Get customer contacts with date range filtering
 */
const getCustomerContacts = async (req, res) => {
    try {
        // Dynamically get models from db connection
        const { Contact } = require('../db_mongo');
        
        const { date_from, date_to } = req.query;
        
        // Build query based on date range with strict validation
        let query = {};
        
        // Validate and apply date range filtering
        if (date_from && date_to) {
            const startDate = new Date(date_from);
            const endDate = new Date(date_to);
            
            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format provided'
                });
            }
            
            // Ensure end date is not before start date
            if (endDate < startDate) {
                return res.status(400).json({
                    success: false,
                    message: 'End date cannot be before start date'
                });
            }
            
            // Apply inclusive date range filtering
            query.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }
        
        // Fetch contacts with date range filtering
        const contacts = await Contact.find(query).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: contacts.map(contact => ({
                id: contact._id,
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                subject: contact.subject,
                message: contact.message,
                createdAt: contact.createdAt,
                updatedAt: contact.updatedAt
            }))
        });
    } catch (error) {
        console.error('Error getting customer contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving customer contacts',
            error: error.message
        });
    }
};

module.exports = {
    getCustomerWiseOrders,
    getCategoryWiseSales,
    getCustomerWiseFeedback,
    getDateRangeWiseSales,
    getInventoryDetails,
    getCustomerContacts
};