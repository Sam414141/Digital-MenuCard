/**
 * React Error Handling Hook
 * Provides consistent error handling across React components
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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

// Error severity levels
export const ERROR_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

const useErrorHandler = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Clear error state
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Parse error from different sources
    const parseError = useCallback((error) => {
        let parsedError = {
            message: 'An unexpected error occurred',
            type: ERROR_TYPES.UNKNOWN,
            severity: ERROR_SEVERITY.MEDIUM,
            code: null,
            details: null,
            timestamp: new Date().toISOString()
        };

        if (error?.response) {
            // Axios error response
            const { status, data } = error.response;
            
            parsedError.message = data?.error?.message || data?.message || `Server error (${status})`;
            parsedError.code = data?.error?.code || `HTTP_${status}`;
            parsedError.details = data?.error?.details || data?.details;
            
            // Classify error type based on status code
            if (status === 400) {
                parsedError.type = ERROR_TYPES.VALIDATION;
                parsedError.severity = ERROR_SEVERITY.LOW;
            } else if (status === 401) {
                parsedError.type = ERROR_TYPES.AUTHENTICATION;
                parsedError.severity = ERROR_SEVERITY.MEDIUM;
            } else if (status === 403) {
                parsedError.type = ERROR_TYPES.AUTHORIZATION;
                parsedError.severity = ERROR_SEVERITY.MEDIUM;
            } else if (status === 404) {
                parsedError.type = ERROR_TYPES.NOT_FOUND;
                parsedError.severity = ERROR_SEVERITY.LOW;
            } else if (status >= 500) {
                parsedError.type = ERROR_TYPES.SERVER;
                parsedError.severity = ERROR_SEVERITY.HIGH;
            }
        } else if (error?.request) {
            // Network error
            parsedError.message = 'Network error. Please check your connection.';
            parsedError.type = ERROR_TYPES.NETWORK;
            parsedError.severity = ERROR_SEVERITY.MEDIUM;
            parsedError.code = 'NETWORK_ERROR';
        } else if (error?.message) {
            // JavaScript error
            parsedError.message = error.message;
            parsedError.code = error.name || 'JS_ERROR';
        }

        return parsedError;
    }, []);

    // Handle error with appropriate actions
    const handleError = useCallback((error, options = {}) => {
        const parsedError = parseError(error);
        
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error handled:', {
                original: error,
                parsed: parsedError
            });
        }

        // Send error to logging service (if available)
        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: parsedError.message,
                fatal: parsedError.severity === ERROR_SEVERITY.CRITICAL
            });
        }

        // Handle specific error types
        switch (parsedError.type) {
            case ERROR_TYPES.AUTHENTICATION:
                if (options.redirectOnAuth !== false) {
                    // Clear user session and redirect to login
                    localStorage.removeItem('authToken');
                    navigate('/login');
                    return;
                }
                break;
                
            case ERROR_TYPES.AUTHORIZATION:
                if (options.redirectOnAuth !== false) {
                    navigate('/unauthorized');
                    return;
                }
                break;
                
            case ERROR_TYPES.NOT_FOUND:
                if (options.redirectOnNotFound !== false) {
                    navigate('/404');
                    return;
                }
                break;
        }

        // Set error state for component to handle
        setError(parsedError);

        // Auto-clear error after specified time
        if (options.autoClear !== false) {
            const clearTime = options.clearAfter || 5000;
            setTimeout(clearError, clearTime);
        }

        // Call custom error handler if provided
        if (options.onError) {
            options.onError(parsedError);
        }
    }, [parseError, navigate, clearError]);

    // Async operation wrapper with error handling
    const withErrorHandling = useCallback(async (asyncOperation, options = {}) => {
        try {
            setIsLoading(true);
            clearError();
            
            const result = await asyncOperation();
            return result;
        } catch (error) {
            handleError(error, options);
            throw error; // Re-throw for component-specific handling
        } finally {
            setIsLoading(false);
        }
    }, [handleError, clearError]);

    // Form submission wrapper
    const handleFormSubmit = useCallback(async (submitFunction, options = {}) => {
        return withErrorHandling(submitFunction, {
            autoClear: false,
            ...options
        });
    }, [withErrorHandling]);

    // API call wrapper
    const handleApiCall = useCallback(async (apiCall, options = {}) => {
        return withErrorHandling(apiCall, {
            redirectOnAuth: true,
            ...options
        });
    }, [withErrorHandling]);

    // Retry mechanism
    const retryOperation = useCallback(async (operation, maxRetries = 3, delay = 1000) => {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                // Don't retry client errors (4xx)
                if (error?.response?.status >= 400 && error?.response?.status < 500) {
                    throw error;
                }
                
                // Wait before retrying (exponential backoff)
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, delay * attempt));
                }
            }
        }
        
        throw lastError;
    }, []);

    // Error boundary fallback
    const getErrorBoundaryFallback = useCallback((error, errorInfo) => {
        const parsedError = parseError(error);
        
        return (
            <div className="error-boundary">
                <h2>Something went wrong</h2>
                <p>{parsedError.message}</p>
                <details>
                    <summary>Error Details</summary>
                    <pre>{errorInfo?.componentStack}</pre>
                </details>
                <button onClick={() => window.location.reload()}>
                    Reload Page
                </button>
            </div>
        );
    }, [parseError]);

    return {
        error,
        isLoading,
        clearError,
        handleError,
        withErrorHandling,
        handleFormSubmit,
        handleApiCall,
        retryOperation,
        getErrorBoundaryFallback,
        
        // Helper methods
        isErrorType: (type) => error?.type === type,
        isErrorSeverity: (severity) => error?.severity === severity,
        hasError: () => !!error
    };
};

export default useErrorHandler;