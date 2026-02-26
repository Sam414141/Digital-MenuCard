// Load environment variables first
require('dotenv').config({ path: __dirname + '/.env' });
console.log('Environment variables loaded');
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const express = require('express');
const cors = require("cors");
const helmet = require('helmet');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
// const rateLimit = require('express-rate-limit'); // REMOVED as per user request
const { connectDB } = require('./db_mongo'); // MongoDB connection instead of PostgreSQL
const os = require('os');

// Function to get the local IP address
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const interface = interfaces[interfaceName];
    for (const config of interface) {
      if (!config.internal && config.family === 'IPv4') {
        return config.address;
      }
    }
  }
  return 'localhost';
};
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
// Import error handling and logging
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import MongoDB routes instead of PostgreSQL routes
const authRoutes = require('./routes/auth_mongo');
const userRoutes = require('./routes/users_mongo');
const favoritesRoutes = require('./routes/favorites_mongo');
const waiterRoutes = require('./routes/waiter_mongo');
const kitchenRoutes = require('./routes/kitchen_mongo');
const menuRoutes = require('./routes/menu_mongo');
const ordersRoutes = require('./routes/orders_mongo');
const analyticsRoutes = require('./routes/analytics_mongo');
const inventoryRoutes = require('./routes/inventory_mongo');
const promotionsRoutes = require('./routes/promotions_mongo');
const paymentRoutes = require('./routes/payments');
const feedbackRoutes = require('./routes/feedback_mongo');
const contactRoutes = require('./routes/contact_mongo');
const reportsRoutes = require('./routes/reports_mongo');

const adminRoutes = require('./routes/admin_mongo');
const { optionalAuth } = require('./middleware/auth_mongo');
const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false
}));

// Rate limiting - REMOVED as per user request
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 1000, // limit each IP to 1000 requests per windowMs
//     message: {
//         error: 'Too many requests from this IP, please try again later.',
//         code: 'RATE_LIMIT_EXCEEDED'
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
//     // Skip rate limiting for authentication and user-related endpoints to prevent login issues
//     skip: (req, res) => {
//         const authEndpoints = [
//             '/api/auth/login',
//             '/api/auth/register',
//             '/api/auth/forgot-password',
//             '/api/auth/reset-password',
//             '/api/users/profile',
//             '/api/waiter/orders',
//             '/api/orders/history',
//             '/api/kitchen/orders',
//             '/api/menu',
//             '/api/menu/categories',
//             '/api/menu/items'
//         ];
//         return authEndpoints.includes(req.path);
//     }
// });

// More generous rate limiting for waiter routes (higher traffic expected) - REMOVED as per user request
// const waiterLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 2000, // limit each IP to 2000 requests per windowMs
//     message: {
//         error: 'Too many requests from this IP, please try again later.',
//         code: 'RATE_LIMIT_EXCEEDED'
//     },
//     standardHeaders: true,
//     legacyHeaders: false
// });
// More generous rate limiting for kitchen routes (higher traffic expected) - REMOVED as per user request
// const kitchenLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 2000, // limit each IP to 2000 requests per windowMs
//     message: {
//         error: 'Too many requests from this IP, please try again later.',
//         code: 'RATE_LIMIT_EXCEEDED'
//     },
//     standardHeaders: true,
//     legacyHeaders: false
// });

// app.use('/api/', limiter);
// app.use('/api/waiter/', waiterLimiter);
// app.use('/api/kitchen/', kitchenLimiter);

// Request logging middleware
app.use(logger.requestLogger());// Body parsing
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
// Allow a comma-separated list via CORS_ORIGIN env, else default to common dev origins including local network IPs
const defaultAllowed = [
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://10.30.168.176:5174',  // Current user's IP
    'http://10.30.168.176:3001'  // Backend IP for self-referencing
];
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : defaultAllowed;

// Configure CORS middleware
const corsOptions = {
    origin: function(origin, callback) {
        // Allow requests with no origin (e.g., mobile apps, curl)
        if (!origin) return callback(null, true);
        
        // In development, be more permissive but only log blocked origins
        if (process.env.NODE_ENV === 'development') {
            // Check if origin is in allowed list
            if (allowedOrigins.indexOf(origin) === -1) {
                // Only log once per unique blocked origin to reduce spam
                if (!corsOptions._loggedOrigins) corsOptions._loggedOrigins = new Set();
                if (!corsOptions._loggedOrigins.has(origin)) {
                    console.warn('CORS blocked origin in development:', origin);
                    corsOptions._loggedOrigins.add(origin);
                }
            }
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            // Only log blocked origins in production
            console.warn('CORS blocked origin:', origin);
            return callback(new Error('CORS policy: Origin not allowed'), false);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    exposedHeaders: ['Access-Control-Allow-Origin']
};
app.use(cors(corsOptions));

// Explicitly handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

// Serve static files from the frontend public directory
app.use('/images', express.static(path.join(__dirname, '..', 'frontend', 'public', 'images')));

// Example route
app.get('/', (req, res) => {
    res.send("<h1>Welcome to Digital Menu Card System's API's<h1>");
});

let server;
let protocol = 'http';
let PORT = process.env.PORT || 3001;

// Create HTTP server
server = http.createServer(app);
console.log('⚠️  HTTP mode - no video conferencing');
// Database health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Test MongoDB connection
        const mongoose = require('mongoose');
        const dbState = mongoose.connection.readyState;
        const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : dbState === 3 ? 'disconnecting' : 'disconnected';
        
        res.json({
            status: 'healthy',
            database: {
                connected: dbState === 1,
                status: dbStatus,
                host: process.env.MONGODB_URI ? process.env.MONGODB_URI.split('@')[1]?.split('/')[0] : 'unknown',
                name: process.env.MONGODB_URI ? process.env.MONGODB_URI.split('/').pop() : 'unknown'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        // Minimize console logging in health check
        if (process.env.NODE_ENV === 'development') {
            console.error('Health check error:', error.message);
        }
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/waiter', waiterRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reports', reportsRoutes);

app.use('/api/admin', adminRoutes);

// Error handling middleware (should be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server and initialize database
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();
        
        // Get IP address for logging
        const ipAddress = getLocalIP();
        console.log('IPv4 =', ipAddress);

        // Bind server to all interfaces (0.0.0.0) so localhost and LAN IPs work
        const listenHost = '0.0.0.0';
        server.listen(PORT, listenHost, () => {
            console.log('[%s] INFO: 🚀 Digital Menu Card API Server started on %s://%s:%d', new Date().toISOString(), protocol, ipAddress, PORT);
            
            // Only show detailed info in development
            if (process.env.NODE_ENV === 'development') {
                console.log(JSON.stringify({
                    protocol,
                    port: PORT.toString(),
                    ip: ipAddress,
                    environment: process.env.NODE_ENV || 'development',
                    nodeVersion: process.version,
                    timestamp: new Date().toISOString()
                }, null, 2));
                
                console.log('🎉 Server is running successfully!');
                console.log('📍 URL: %s://%s:%d', protocol, ipAddress, PORT);
                console.log('🔍 Health Check: %s://%s:%d/health', protocol, ipAddress, PORT);
                console.log('📊 API Docs: %s://%s:%d/api-docs (when implemented)', protocol, ipAddress, PORT);
                

            }
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();