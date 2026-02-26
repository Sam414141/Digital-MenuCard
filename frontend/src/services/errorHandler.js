/**
 * Centralized Error Handler
 * Provides consistent error handling across the application
 */

import { toast } from 'react-toastify';

// Error severity levels
export const ERROR_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

// Error types
export const ERROR_TYPES = {
    VALIDATION: 'validation',
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    NOT_FOUND: 'not_found',
    NETWORK: 'network',
    SERVER: 'server',
    UNKNOWN: 'unknown'
};

class ErrorHandler {
    constructor() {
        this.errorCallbacks = [];
    }

    /**
     * Register error callback
     * @param {function} callback - Callback function for error handling
     */
    registerCallback(callback) {
        this.errorCallbacks.push(callback);
    }

    /**
     * Remove error callback
     * @param {function} callback - Callback function to remove
     */
    unregisterCallback(callback) {
        this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    }

    /**
     * Parse error object into standardized format
     * @param {Error|object} error - Error object
     * @returns {object} Parsed error
     */
    parseError(error) {
        const parsedError = {
            message: 'An unexpected error occurred',
            type: ERROR_TYPES.UNKNOWN,
            severity: ERROR_SEVERITY.MEDIUM,
            code: null,
            details: null,
            timestamp: new Date().toISOString(),
            originalError: error
        };

        if (error?.status) {
            // API Service error format
            parsedError.message = error.message || 'API request failed';
            parsedError.code = `API_${error.status}`;

            // Classify based on status code
            if (error.status === 400) {
                parsedError.type = ERROR_TYPES.VALIDATION;
                parsedError.severity = ERROR_SEVERITY.LOW;
            } else if (error.status === 401) {
                parsedError.type = ERROR_TYPES.AUTHENTICATION;
                parsedError.severity = ERROR_SEVERITY.HIGH;
            } else if (error.status === 403) {
                parsedError.type = ERROR_TYPES.AUTHORIZATION;
                parsedError.severity = ERROR_SEVERITY.HIGH;
            } else if (error.status === 404) {
                parsedError.type = ERROR_TYPES.NOT_FOUND;
                parsedError.severity = ERROR_SEVERITY.MEDIUM;
            } else if (error.status >= 500) {
                parsedError.type = ERROR_TYPES.SERVER;
                parsedError.severity = ERROR_SEVERITY.HIGH;
            }
        } else if (error?.response) {
            // Axios error response
            const { status, data } = error.response;
            
            parsedError.message = data?.message || `Server error (${status})`;
            parsedError.code = data?.code || `HTTP_${status}`;
            parsedError.details = data?.details;

            // Classify based on status code
            if (status === 400) {
                parsedError.type = ERROR_TYPES.VALIDATION;
                parsedError.severity = ERROR_SEVERITY.LOW;
            } else if (status === 401) {
                parsedError.type = ERROR_TYPES.AUTHENTICATION;
                parsedError.severity = ERROR_SEVERITY.HIGH;
            } else if (status === 403) {
                parsedError.type = ERROR_TYPES.AUTHORIZATION;
                parsedError.severity = ERROR_SEVERITY.HIGH;
            } else if (status === 404) {
                parsedError.type = ERROR_TYPES.NOT_FOUND;
                parsedError.severity = ERROR_SEVERITY.MEDIUM;
            } else if (status >= 500) {
                parsedError.type = ERROR_TYPES.SERVER;
                parsedError.severity = ERROR_SEVERITY.HIGH;
            }
        } else if (error?.request) {
            // Network error
            parsedError.message = 'Network error. Please check your connection.';
            parsedError.type = ERROR_TYPES.NETWORK;
            parsedError.severity = ERROR_SEVERITY.HIGH;
            parsedError.code = 'NETWORK_ERROR';
        } else if (error?.message) {
            // JavaScript error
            parsedError.message = error.message;
            parsedError.code = error.name || 'JS_ERROR';
        }

        return parsedError;
    }

    /**
     * Handle error with appropriate actions
     * @param {Error|object} error - Error object
     * @param {object} options - Handling options
     */
    handleError(error, options = {}) {
        const parsedError = this.parseError(error);
        
        // Log error in development - commented out to reduce noise
        // if (process.env.NODE_ENV === 'development') {
        //     console.group('🚨 Error Handler');
        //     console.error('Original Error:', error);
        //     console.error('Parsed Error:', parsedError);
        //     console.groupEnd();
        // }

        // Send to analytics/logging service
        this.logError(parsedError);

        // Handle specific error types
        this.handleSpecificErrors(parsedError, options);

        // Show user notification if not disabled
        if (options.showToast !== false) {
            this.showErrorToast(parsedError, options);
        }

        // Notify registered callbacks
        this.notifyCallbacks(parsedError);

        return parsedError;
    }

    /**
     * Handle specific error types
     * @param {object} parsedError - Parsed error object
     * @param {object} options - Handling options
     */
    handleSpecificErrors(parsedError, options) {
        // Check if redirection should be prevented due to a flag on the original error
        const preventRedirect = options.preventRedirect || (parsedError.originalError && parsedError.originalError.preventRedirect);
        
        console.log('🔍 ErrorHandler.handleSpecificErrors:', {
            type: parsedError.type,
            preventRedirect,
            willRedirect: parsedError.type === 'authentication' && !preventRedirect
        });
        
        switch (parsedError.type) {
            case ERROR_TYPES.AUTHENTICATION:
                if (options.redirectOnAuth !== false && !preventRedirect) {
                    // Clear auth token and redirect to login
                    console.warn('⚠️ Redirecting to login due to authentication error');
                    localStorage.removeItem('authToken');
                    window.location.href = '/login';
                } else {
                    console.log('✅ Prevented redirect on authentication error (preventRedirect=true)');
                }
                break;
                
            case ERROR_TYPES.AUTHORIZATION:
                if (options.redirectOnAuth !== false && options.redirectOnAuthorization !== false && !preventRedirect) {
                    window.location.href = '/unauthorized';
                }
                break;
                
            case ERROR_TYPES.NOT_FOUND:
                if (options.redirectOnNotFound !== false && options.currentPath && !preventRedirect) {
                    window.location.href = '/404';
                }
                break;
        }
    }

    /**
     * Show error toast notification
     * @param {object} parsedError - Parsed error object
     * @param {object} options - Toast options
     */
    showErrorToast(parsedError, options) {
        const toastOptions = {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            ...options.toastOptions
        };

        // Customize message for user-friendly display
        let displayMessage = parsedError.message;

        // Make common errors more user-friendly
        switch (parsedError.type) {
            case ERROR_TYPES.NETWORK:
                displayMessage = 'Connection problem. Please check your internet.';
                break;
            case ERROR_TYPES.SERVER:
                displayMessage = 'Server error. Please try again later.';
                break;
            case ERROR_TYPES.AUTHENTICATION:
                displayMessage = 'Please log in to continue.';
                break;
            case ERROR_TYPES.AUTHORIZATION:
                displayMessage = 'You don\'t have permission to access this.';
                break;
            case ERROR_TYPES.NOT_FOUND:
                displayMessage = 'The requested resource was not found.';
                break;
        }

        // Show toast based on severity
        switch (parsedError.severity) {
            case ERROR_SEVERITY.LOW:
                toast.warn(displayMessage, toastOptions);
                break;
            case ERROR_SEVERITY.MEDIUM:
                toast.error(displayMessage, toastOptions);
                break;
            case ERROR_SEVERITY.HIGH:
            case ERROR_SEVERITY.CRITICAL:
                toast.error(displayMessage, { ...toastOptions, autoClose: 8000 });
                break;
            default:
                toast.error(displayMessage, toastOptions);
        }
    }

    /**
     * Log error to external service
     * @param {object} parsedError - Parsed error object
     */
    logError(parsedError) {
        // Log to console in development - commented out to reduce noise
        // if (process.env.NODE_ENV === 'development') {
        //     console.error('ErrorHandler:', parsedError);
        // }

        // Send to external logging service (e.g., Sentry, LogRocket, etc.)
        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: parsedError.message,
                fatal: parsedError.severity === ERROR_SEVERITY.CRITICAL,
                error_type: parsedError.type,
                error_code: parsedError.code
            });
        }

        // You can add other logging services here
        // Example: Sentry.captureException(parsedError);
    }

    /**
     * Notify registered callbacks
     * @param {object} parsedError - Parsed error object
     */
    notifyCallbacks(parsedError) {
        this.errorCallbacks.forEach(callback => {
            try {
                callback(parsedError);
            } catch (callbackError) {
                console.error('Error in error callback:', callbackError);
            }
        });
    }

    /**
     * Create retry mechanism
     * @param {function} operation - Operation to retry
     * @param {number} maxRetries - Maximum retry attempts
     * @param {number} delay - Delay between retries
     * @returns {Promise} Operation result
     */
    async withRetry(operation, maxRetries = 3, delay = 1000) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                const parsedError = this.parseError(error);
                
                // Don't retry client errors (4xx) or certain error types
                if (parsedError.type === ERROR_TYPES.VALIDATION ||
                    parsedError.type === ERROR_TYPES.AUTHENTICATION ||
                    parsedError.type === ERROR_TYPES.AUTHORIZATION ||
                    parsedError.type === ERROR_TYPES.NOT_FOUND) {
                    throw error;
                }
                
                // Wait before retrying (exponential backoff)
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, delay * attempt));
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Async operation wrapper with error handling
     * @param {function} operation - Async operation
     * @param {object} options - Error handling options
     * @returns {Promise} Operation result
     */
    async executeWithHandling(operation, options = {}) {
        try {
            return await operation();
        } catch (error) {
            const parsedError = this.handleError(error, options);
            
            // Re-throw if caller wants to handle it
            if (options.rethrow !== false) {
                throw parsedError;
            }
            
            return null;
        }
    }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

export default errorHandler;

// Export convenience functions
export const handleError = (error, options) => errorHandler.handleError(error, options);
export const withRetry = (operation, maxRetries, delay) => errorHandler.withRetry(operation, maxRetries, delay);
export const executeWithHandling = (operation, options) => errorHandler.executeWithHandling(operation, options);