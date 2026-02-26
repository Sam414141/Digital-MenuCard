/**
 * Comprehensive Error Handling Middleware
 * Handles all types of errors with structured logging and appropriate responses
 */

const logger = require('../utils/logger');

// Custom Error Classes
class AppError extends Error {
    constructor(message, statusCode, errorCode = null, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        this.isOperational = true;
        this.timestamp = new Date().toISOString();
        
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
    }
}

class DatabaseError extends AppError {
    constructor(message, details = null) {
        super(message, 500, 'DATABASE_ERROR', details);
    }
}

class ExternalServiceError extends AppError {
    constructor(service, message) {
        super(`External service error: ${service} - ${message}`, 503, 'EXTERNAL_SERVICE_ERROR');
    }
}

// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error details
    logger.error('Error occurred:', {
        error: {
            message: err.message,
            stack: err.stack,
            statusCode: err.statusCode,
            errorCode: err.errorCode,
            details: err.details
        },
        request: {
            method: req.method,
            url: req.url,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            user: req.user?.id || 'anonymous'
        },
        timestamp: new Date().toISOString()
    });

    // Handle specific error types
    
    // Database connection errors
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        error = new DatabaseError('Database connection failed');
    }
    
    // PostgreSQL errors
    if (err.code && err.code.startsWith('23')) {
        if (err.code === '23505') {
            error = new ValidationError('Duplicate entry', { 
                field: err.detail || 'Unknown field' 
            });
        } else if (err.code === '23503') {
            error = new ValidationError('Foreign key constraint violation');
        } else if (err.code === '23502') {
            error = new ValidationError('Required field is missing');
        }
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new AuthenticationError('Invalid token');
    } else if (err.name === 'TokenExpiredError') {
        error = new AuthenticationError('Token expired');
    }
    
    // Validation errors from express-validator
    if (err.errors && Array.isArray(err.errors)) {
        error = new ValidationError('Validation failed', err.errors);
    }

    // Mongoose/Database cast errors
    if (err.name === 'CastError') {
        error = new ValidationError('Invalid ID format');
    }

    // Rate limiting errors
    if (err.status === 429) {
        error = new AppError('Too many requests, please try again later', 429, 'RATE_LIMIT_ERROR');
    }

    // File upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        error = new ValidationError('File too large');
    }

    // Default to 500 server error
    if (!error.statusCode) {
        error = new AppError('Internal server error', 500, 'INTERNAL_ERROR');
    }

    // Send error response
    const errorResponse = {
        success: false,
        error: {
            message: error.message,
            code: error.errorCode || 'UNKNOWN_ERROR',
            timestamp: error.timestamp || new Date().toISOString()
        }
    };

    // Include error details in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.error.details = error.details;
        errorResponse.error.stack = error.stack;
    }

    // Include validation details for client
    if (error.details && error.statusCode < 500) {
        errorResponse.error.details = error.details;
    }

    res.status(error.statusCode).json(errorResponse);
};

// Async error catcher wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler for undefined routes
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl}`);
    next(error);
};

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection:', {
        reason: reason,
        promise: promise,
        timestamp: new Date().toISOString()
    });
    
    // Graceful shutdown
    process.exit(1);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
    
    // Graceful shutdown
    process.exit(1);
});

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    DatabaseError,
    ExternalServiceError,
    errorHandler,
    asyncHandler,
    notFoundHandler
};