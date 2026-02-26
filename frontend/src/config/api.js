/**
 * API Configuration for Digital Menu Card
 * Centralized configuration for all API endpoints and server communication
 * 
 * This module provides:
 * - Base API configuration
 * - Comprehensive endpoint definitions
 * - URL building utilities
 * - Request configuration defaults
 */

// Import IP context - but we need a different approach since this is not a React component
// We'll use a simpler approach and rely on the IpContext for React components
// For this config file, we'll use a simple default that will be overridden by services

let currentServerIP = "localhost"; // Use localhost for frontend API by default

// Function to update the current IP
export const updateServerIP = (newIP) => {
    currentServerIP = newIP;
};

// Get the base API URL using the current IP
const getBaseURL = () => {
    // Use HTTP for our backend
    // Use port 3001 for HTTP
    const protocol = 'http';
    const port = '3001';
    return `${protocol}://${currentServerIP}:${port}`;
};

// Base configuration
export const API_CONFIG = {
    BASE_URL: getBaseURL(),
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3
};

// API endpoints
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
        REFRESH: '/api/auth/refresh',
        FORGOT_PASSWORD: '/api/auth/forgot-password',
        RESET_PASSWORD: '/api/auth/reset-password',
        VALIDATE_EMAIL: '/api/auth/validate-email'
    },
    
    // User management
    USERS: {
        PROFILE: '/api/users/profile',
        UPDATE: '/api/users/profile',
        DIETARY_RESTRICTIONS: '/api/users/dietary-restrictions',
        UPDATE_DIETARY_RESTRICTIONS: '/api/users/dietary-restrictions',
        PREFERENCES: '/api/users/preferences',
        UPDATE_PREFERENCES: '/api/users/preferences',
        CHANGE_PASSWORD: '/api/users/change-password',
        STATS: '/api/users/stats'
    },
    
    // Favorites
    FAVORITES: {
        LIST: '/api/favorites',
        ADD: '/api/favorites',
        REMOVE: (favoriteId) => `/api/favorites/${favoriteId}`,
        CHECK: (menuItemId) => `/api/favorites/check/${menuItemId}`
    },
    
    // Menu and ordering
    MENU: {
        LIST: '/api/menu',
        CATEGORIES: '/api/menu/categories',
        ITEMS: '/api/menu',
        ITEM_DETAILS: (itemId) => `/api/menu/items/${itemId}`,
        CHECK_ALLERGENS: '/api/menu/check-allergens',
        // Admin CRUD operations
        CREATE: '/api/menu',
        UPDATE: (itemId) => `/api/menu/${itemId}`,
        DELETE: (itemId) => `/api/menu/${itemId}`,
        UPDATE_AVAILABILITY: (itemId) => `/api/menu/${itemId}/availability`,
        UPDATE_STATUS: (itemId) => `/api/menu/${itemId}/status`,
        UPDATE_ALLERGENS: (itemId) => `/api/menu/${itemId}/allergens`,
        UPDATE_DIETARY: (itemId) => `/api/menu/${itemId}/dietary-restrictions`
    },
    
    // Orders
    ORDERS: {
        CREATE: '/api/orders',
        LIST: '/api/orders',
        DETAILS: (orderId) => `/api/orders/${orderId}`,
        STATUS: '/api/orders/status',
        UPDATE_STATUS: '/api/orders/status',
        HISTORY: '/api/orders/history',
        REORDER: (orderId) => `/api/orders/${orderId}/reorder`
    },
    
    // Analytics
    ANALYTICS: {
        MENU_PERFORMANCE: '/api/analytics/menu-performance',
        SALES_TRENDS: '/api/analytics/sales-trends',
        CUSTOMER_INSIGHTS: '/api/analytics/customer-insights',
        SALES: '/api/analytics/sales',
        SALES_BY_CATEGORY: '/api/analytics/sales-by-category',
        POPULAR_ITEMS: '/api/analytics/popular-items',
        PEAK_HOURS: '/api/analytics/peak-hours',
        REVENUE_BY_CATEGORY: '/api/analytics/revenue-by-category',
        CUSTOMER_DEMOGRAPHICS: '/api/analytics/customer-demographics',
        ORDER_PATTERNS: '/api/analytics/order-patterns',
        SALES_FORECAST: '/api/analytics/sales-forecast',
        PERFORMANCE: '/api/analytics/performance',
        INVENTORY_TURNOVER: '/api/analytics/inventory-turnover',
        COMPREHENSIVE_REPORTS: '/api/analytics/comprehensive-reports',
        GENERATE_TEST_DATA: '/api/analytics/generate-test-data'
    },
    
    // Reports
    REPORTS: {
        CUSTOMER_WISE_ORDERS: '/api/reports/customer-wise-orders',
        CATEGORY_WISE_SALES: '/api/reports/category-wise-sales',
        CUSTOMER_WISE_FEEDBACK: '/api/reports/customer-wise-feedback',
        DATE_RANGE_WISE_SALES: '/api/reports/date-range-wise-sales',
        INVENTORY_DETAILS: '/api/reports/inventory-details',
        CUSTOMER_CONTACTS: '/api/reports/customer-contacts'
    },
    
    // Inventory
    INVENTORY: {
        LIST: '/api/inventory',
        CREATE: '/api/inventory',
        UPDATE: '/api/inventory',
        DELETE: '/api/inventory',
        ALERTS: '/api/inventory/alerts',
        REPORT: '/api/inventory/report',
        USAGE: '/api/inventory/usage',
        USAGE_HISTORY: '/api/inventory/usage-history',
        BULK_UPDATE: '/api/inventory/bulk-update'
    },
    
    // Promotions
    PROMOTIONS: {
        LIST: '/api/promotions',
        CREATE: '/api/promotions',
        UPDATE: (promotionId) => `/api/promotions/${promotionId}`,
        DELETE: (promotionId) => `/api/promotions/${promotionId}`,
        VALIDATE: '/api/promotions/validate',
        ANALYTICS: '/api/promotions/analytics'
    },
    
    // Waiter operations
    WAITER: {
        ORDERS: '/api/waiter/orders',
        DELIVER_ORDER: '/api/waiter/orders',
        KITCHEN_ORDERS: '/api/waiter/kitchen-orders',
        UPDATE_KITCHEN_ORDER_STATUS: (kitchenOrderId) => `/api/waiter/kitchen-orders/${kitchenOrderId}/status`,
        UPDATE_ORDER_STATUS: (orderId) => `/api/waiter/orders/${orderId}/status`,
        REMOVE_ORDER: '/api/waiter/remove-order',  // Updated to use modern API route
        STATS: '/api/waiter/stats'
    },

    // Kitchen operations
    KITCHEN: {
        ORDERS: '/api/kitchen/orders',
        UPDATE_ORDER_STATUS: (kitchenOrderId) => `/api/kitchen/orders/${kitchenOrderId}/status`,
        STATS: '/api/kitchen/stats'
    },
    
    // Admin operations
    ADMIN: {
        CUSTOMERS: '/api/admin/customers',
        ORDERS: '/api/admin/orders',
        SALES_SUMMARY: '/api/admin/sales-summary',
        FEEDBACKS: '/api/admin/showfeedback',
        CONTACT_REPORTS: '/api/admin/showcontact'
    },
    
    // Feedback operations
    FEEDBACK: {
        SUBMIT: '/api/feedback/submit',
        GET_FOR_ORDER: (orderId) => `/api/feedback/order/${orderId}`,
        GET_USER_FEEDBACKS: '/api/feedback/user',
        GET_ALL: '/api/feedback/all'
    },
    
    // Contact operations
    CONTACT: {
        SUBMIT: '/api/contact/submit',
        GET_ALL: '/api/contact/all',
        GET_BY_ID: (contactId) => `/api/contact/${contactId}`
    },
    
    
    
    // Video operations
    VIDEO: {
        CREATE_SESSION: '/api/video/session',
        CHECK_SESSION: (orderId, itemId) => `/api/video/session/check/${orderId}/${itemId}`,
        JOIN_SESSION: (sessionId) => `/api/video/session/${sessionId}/join`,
        SEND_SIGNAL: (sessionId) => `/api/video/session/${sessionId}/signal`,
        GET_SIGNALS: (sessionId) => `/api/video/session/${sessionId}/signals`,
        END_SESSION: (sessionId) => `/api/video/session/${sessionId}`
    }};

/**
 * Build complete API URL
 * @param {string} endpoint - The endpoint path
 * @param {object} params - Query parameters (optional)
 * @returns {string} Complete URL
 */
export const buildAPIURL = (endpoint, params = {}) => {
    const baseURL = getBaseURL();
    
    // Construct URL with base and endpoint
    const url = new URL(endpoint, baseURL);
    
    // Add query parameters
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
            // Handle arrays by appending each value separately
            if (Array.isArray(params[key])) {
                params[key].forEach(value => {
                    url.searchParams.append(key, value);
                });
            } else {
                url.searchParams.append(key, params[key]);
            }
        }
    });
    
    return url.toString();
};
/**
 * Get API URL for a specific endpoint
 * @param {string} category - Category (e.g., 'ORDERS', 'MENU')
 * @param {string} action - Action (e.g., 'CREATE', 'LIST')
 * @param {object} params - Query parameters (optional)
 * @param {...any} args - Additional arguments for dynamic endpoints
 * @returns {string} Complete URL
 */
export const getAPIURL = (category, action, params = {}, ...args) => {
    const endpoint = API_ENDPOINTS[category]?.[action];
    if (!endpoint) {
        throw new Error(`Invalid API endpoint: ${category}.${action}`);
    }
    
    // Handle function endpoints (for dynamic paths)
    const resolvedEndpoint = typeof endpoint === 'function' ? endpoint(...args) : endpoint;
    
    return buildAPIURL(resolvedEndpoint, params);
};

/**
 * HTTP request methods enum
 */
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH'
};

/**
 * Request configuration defaults
 */
export const REQUEST_CONFIG = {
    TIMEOUT: API_CONFIG.TIMEOUT,
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

export default API_CONFIG;