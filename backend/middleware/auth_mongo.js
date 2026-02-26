const AuthUtils = require('../utils/authUtils');
const { User } = require('../db_mongo');

/**
 * Authentication Middleware
 * Provides JWT token verification and user authentication for MongoDB
 */

/**
 * Verify JWT token middleware
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = AuthUtils.extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Access token is required'
            });
        }

        // Verify the token
        const decoded = AuthUtils.verifyToken(token);
        
        // Check if user still exists and is active
        const userId = decoded.user ? decoded.user.id : decoded.userId;
        const user = await User.findOne({ 
            _id: userId, 
            is_active: true 
        }).select('email first_name last_name role');

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found or inactive'
            });
        }

        // Attach user info to request
        req.user = {
            id: user._id.toString(),
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role
        };

        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        
        return res.status(401).json({
            status: 'error',
            message: error.message || 'Invalid token'
        });
    }
};

/**
 * Optional authentication middleware
 * Adds user info if token is valid, but doesn't require authentication
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = AuthUtils.extractTokenFromHeader(authHeader);

        if (token) {
            const decoded = AuthUtils.verifyToken(token);
            
            const userId = decoded.user ? decoded.user.id : decoded.userId;
            const user = await User.findOne({ 
                _id: userId, 
                is_active: true 
            }).select('email first_name last_name role');

            if (user) {
                req.user = {
                    id: user._id.toString(),
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role
                };
            }
        }

        next();
    } catch (error) {
        // For optional auth, we don't fail on invalid tokens
        console.log('Optional auth warning:', error.message);
        next();
    }
};

/**
 * Admin role verification middleware
 * Requires user to be authenticated and have admin privileges
 */
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        // Check if user has admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Admin access required'
            });
        }

        next();
    } catch (error) {
        console.error('Admin verification error:', error.message);
        return res.status(500).json({
            status: 'error',
            message: 'Admin verification failed'
        });
    }
};

/**
 * Staff role verification middleware
 * Requires user to be authenticated and have staff privileges (waiter, kitchen_staff, or admin)
 */
const requireStaff = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        // Check if user has staff role
        const staffRoles = ['waiter', 'kitchen_staff', 'admin'];
        if (!staffRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Staff access required'
            });
        }

        next();
    } catch (error) {
        console.error('Staff verification error:', error.message);
        return res.status(500).json({
            status: 'error',
            message: 'Staff verification failed'
        });
    }
};

/**
 * Waiter role verification middleware
 * Requires user to be authenticated and have waiter privileges
 */
const requireWaiter = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        // Check if user has waiter role
        if (req.user.role !== 'waiter' && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Waiter access required'
            });
        }

        next();
    } catch (error) {
        console.error('Waiter verification error:', error.message);
        return res.status(500).json({
            status: 'error',
            message: 'Waiter verification failed'
        });
    }
};

/**
 * Kitchen staff role verification middleware
 * Requires user to be authenticated and have kitchen staff privileges
 */
const requireKitchenStaff = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        // Check if user has kitchen staff role
        if (req.user.role !== 'kitchen_staff' && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Kitchen staff access required'
            });
        }

        next();
    } catch (error) {
        console.error('Kitchen staff verification error:', error.message);
        return res.status(500).json({
            status: 'error',
            message: 'Kitchen staff verification failed'
        });
    }
};

/**
 * Rate limiting middleware for authentication endpoints
 */
const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    const attempts = new Map();

    return (req, res, next) => {
        const clientId = req.ip + (req.body.email || '');
        const now = Date.now();
        
        // Clean old entries
        for (const [key, data] of attempts.entries()) {
            if (now - data.firstAttempt > windowMs) {
                attempts.delete(key);
            }
        }

        const clientAttempts = attempts.get(clientId);
        
        if (!clientAttempts) {
            attempts.set(clientId, { count: 1, firstAttempt: now });
            next();
        } else if (clientAttempts.count < maxAttempts) {
            clientAttempts.count++;
            next();
        } else {
            res.status(429).json({
                status: 'error',
                message: 'Too many authentication attempts. Please try again later.',
                retryAfter: Math.ceil((clientAttempts.firstAttempt + windowMs - now) / 1000)
            });
        }
    };
};

module.exports = {
    verifyToken,
    optionalAuth,
    requireAdmin,
    requireStaff,
    requireWaiter,
    requireKitchenStaff,
    authRateLimit
};