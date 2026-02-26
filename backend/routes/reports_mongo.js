/**
 * Reports Routes - MongoDB Implementation
 * Handles all reports-related API endpoints
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth_mongo');


// Middleware to log API requests
router.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Route to get customer-wise order details
router.get('/customer-wise-orders', verifyToken, (req, res) => {
    const reportsController = require('../controllers/reportsController');
    return reportsController.getCustomerWiseOrders(req, res);
});

// Route to get category-wise sales details
router.get('/category-wise-sales', verifyToken, (req, res) => {
    const reportsController = require('../controllers/reportsController');
    return reportsController.getCategoryWiseSales(req, res);
});

// Route to get customer-wise feedback details
router.get('/customer-wise-feedback', verifyToken, (req, res) => {
    const reportsController = require('../controllers/reportsController');
    return reportsController.getCustomerWiseFeedback(req, res);
});

// Route to get date range-wise sales details with grand total
router.get('/date-range-wise-sales', verifyToken, (req, res) => {
    const reportsController = require('../controllers/reportsController');
    return reportsController.getDateRangeWiseSales(req, res);
});

// Route to get inventory details
router.get('/inventory-details', verifyToken, (req, res) => {
    const reportsController = require('../controllers/reportsController');
    return reportsController.getInventoryDetails(req, res);
});

// Route to get customer contacts with date range filtering
router.get('/customer-contacts', verifyToken, (req, res) => {
    const reportsController = require('../controllers/reportsController');
    return reportsController.getCustomerContacts(req, res);
});

module.exports = router;