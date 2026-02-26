/**
 * React Error Boundary Component
 * Catches JavaScript errors in component tree and displays fallback UI
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            errorId: Date.now().toString()
        };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        this.setState({
            error,
            errorInfo
        });

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error Boundary caught an error:', error, errorInfo);
        }

        // Send error to logging service
        this.logErrorToService(error, errorInfo);
    }

    logErrorToService(error, errorInfo) {
        try {
            // Send to analytics if available
            if (window.gtag) {
                window.gtag('event', 'exception', {
                    description: error.toString(),
                    fatal: true,
                    error_id: this.state.errorId
                });
            }

            // Send to custom logging endpoint (implement as needed)
            if (process.env.REACT_APP_LOG_ERRORS === 'true') {
                fetch('/api/client-errors', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        error: error.toString(),
                        stack: error.stack,
                        componentStack: errorInfo.componentStack,
                        timestamp: new Date().toISOString(),
                        userAgent: navigator.userAgent,
                        url: window.location.href,
                        errorId: this.state.errorId
                    })
                }).catch(() => {
                    // Silently fail if logging endpoint is not available
                });
            }
        } catch (loggingError) {
            console.error('Failed to log error:', loggingError);
        }
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleGoBack = () => {
        window.history.back();
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback(this.state.error, this.state.errorInfo);
            }

            // Default error UI
            const { error, errorInfo } = this.state;
            const isDevelopment = process.env.NODE_ENV === 'development';

            return (
                <div className="error-boundary">
                    <div className="error-boundary-container">
                        <div className="error-boundary-icon">
                            <AlertTriangle size={64} />
                        </div>
                        
                        <div className="error-boundary-content">
                            <h1>Oops! Something went wrong</h1>
                            <p className="error-boundary-message">
                                We apologize for the inconvenience. An unexpected error has occurred.
                            </p>
                            
                            {isDevelopment && error && (
                                <div className="error-boundary-details">
                                    <h3>Error Details (Development Mode)</h3>
                                    <div className="error-boundary-error-message">
                                        <strong>Error:</strong> {error.toString()}
                                    </div>
                                    {error.stack && (
                                        <details className="error-boundary-stack">
                                            <summary>Stack Trace</summary>
                                            <pre>{error.stack}</pre>
                                        </details>
                                    )}
                                    {errorInfo?.componentStack && (
                                        <details className="error-boundary-component-stack">
                                            <summary>Component Stack</summary>
                                            <pre>{errorInfo.componentStack}</pre>
                                        </details>
                                    )}
                                </div>
                            )}
                            
                            <div className="error-boundary-actions">
                                <button 
                                    onClick={this.handleRetry}
                                    className="error-boundary-btn error-boundary-btn-primary"
                                >
                                    <RefreshCw size={16} />
                                    Try Again
                                </button>
                                
                                <button 
                                    onClick={this.handleGoHome}
                                    className="error-boundary-btn error-boundary-btn-secondary"
                                >
                                    <Home size={16} />
                                    Go Home
                                </button>
                                
                                <button 
                                    onClick={this.handleGoBack}
                                    className="error-boundary-btn error-boundary-btn-secondary"
                                >
                                    <ArrowLeft size={16} />
                                    Go Back
                                </button>
                                
                                <button 
                                    onClick={this.handleReload}
                                    className="error-boundary-btn error-boundary-btn-tertiary"
                                >
                                    Reload Page
                                </button>
                            </div>
                            
                            {this.state.errorId && (
                                <p className="error-boundary-error-id">
                                    Error ID: {this.state.errorId}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = (Component, fallback = null) => {
    return function WithErrorBoundaryComponent(props) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
};

// Hook for error boundary in functional components
export const useErrorHandler = () => {
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    return setError;
};

export default ErrorBoundary;