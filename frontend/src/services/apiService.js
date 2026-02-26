/**
 * Comprehensive API Service Layer
 * Centralized service for all API communications with proper error handling
 */

import axios from 'axios';
import { API_CONFIG, getAPIURL, HTTP_METHODS } from '../config/api';
import { updateServerIP } from '../config/api'; // Import the IP update function
import errorHandler from './errorHandler';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if redirection should be prevented and other options
        // Look in error.config for custom flags first, then check error itself
        const preventRedirect = error?.config?.preventRedirect || error?.preventRedirect;
        const showToast = error?.config?.showToast !== undefined ? error?.config?.showToast : (error?.showToast !== undefined ? error?.showToast : true);
        
        console.log('🔴 Response Interceptor Error:', {
            status: error?.response?.status,
            preventRedirect,
            showToast,
            configPreventRedirect: error?.config?.preventRedirect,
            configShowToast: error?.config?.showToast
        });
        
        errorHandler.handleError(error, { preventRedirect, showToast });
        // Always reject the promise so that callers can handle the error
        return Promise.reject(error);
    }
);

/**
 * Generic API request function
 * @param {string} method - HTTP method
 * @param {string} url - API endpoint URL
 * @param {object} data - Request data (for POST/PUT)
 * @param {object} config - Additional axios config
 * @param {number} retries - Number of retry attempts
 * @returns {Promise}
 */
const request = async (method, url, data = null, config = {}, retries = 3) => {
    try {
        // Prepare merged axios config
        const axiosConfig = {
            method,
            url,
            data,
            ...config
        };
        
        // These custom flags will be available in error.config in the response interceptor
        if (config.preventRedirect) {
            axiosConfig.preventRedirect = config.preventRedirect;
        }
        if (config.showToast !== undefined) {
            axiosConfig.showToast = config.showToast;
        }
        
        const response = await apiClient(axiosConfig);
        return response.data;
    } catch (error) {
        // Log the error for debugging
        if (error.config) {
            console.log('📋 Request Config:', {
                preventRedirect: error.config.preventRedirect,
                showToast: error.config.showToast
            });
        }
        throw error;
    }
};

/**
 * API Service - Centralized service for all API communications
 */
const apiService = {
    // Set the server IP for all subsequent requests
    setServerIP: (ip) => {
        updateServerIP(ip);
    },

    /**
     * AUTHENTICATION ENDPOINTS
     */
    login: (email, password) => 
        request(HTTP_METHODS.POST, getAPIURL('AUTH', 'LOGIN'), { email, password }, { preventRedirect: true, showToast: false }),
        
    register: (userData) => 
        request(HTTP_METHODS.POST, getAPIURL('AUTH', 'REGISTER'), userData, { preventRedirect: true, showToast: false }),
        
    logout: () => 
        request(HTTP_METHODS.POST, getAPIURL('AUTH', 'LOGOUT')),
        
    refreshToken: () => 
        request(HTTP_METHODS.POST, getAPIURL('AUTH', 'REFRESH')),
        
    forgotPassword: (email) => 
        request(HTTP_METHODS.POST, getAPIURL('AUTH', 'FORGOT_PASSWORD'), { email }),
        
    resetPassword: (token, newPassword) => 
        request(HTTP_METHODS.POST, getAPIURL('AUTH', 'RESET_PASSWORD'), { token, newPassword }),
        
    validateEmail: (email) => 
        request(HTTP_METHODS.GET, getAPIURL('AUTH', 'VALIDATE_EMAIL', { email })),

    /**
     * USER MANAGEMENT ENDPOINTS
     */
    getUserProfile: () => 
        request(HTTP_METHODS.GET, getAPIURL('USERS', 'PROFILE')),
        
    updateUserProfile: (userData) => 
        request(HTTP_METHODS.PUT, getAPIURL('USERS', 'UPDATE'), userData),
        
    getUserDietaryRestrictions: () => 
        request(HTTP_METHODS.GET, getAPIURL('USERS', 'DIETARY_RESTRICTIONS')),
        
    updateUserDietaryRestrictions: (restrictions) => 
        request(HTTP_METHODS.PUT, getAPIURL('USERS', 'UPDATE_DIETARY_RESTRICTIONS'), { restrictions }),
        
    getUserPreferences: () => 
        request(HTTP_METHODS.GET, getAPIURL('USERS', 'PREFERENCES')),
        
    updateUserPreferences: (preferences) => 
        request(HTTP_METHODS.PUT, getAPIURL('USERS', 'UPDATE_PREFERENCES'), { preferences }),
        
    changePassword: (currentPassword, newPassword) => 
        request(HTTP_METHODS.PUT, getAPIURL('USERS', 'CHANGE_PASSWORD'), { currentPassword, newPassword }),
        
    getUserStats: () => 
        request(HTTP_METHODS.GET, getAPIURL('USERS', 'STATS')),

    /**
     * FAVORITES ENDPOINTS
     */
    getFavorites: () => 
        request(HTTP_METHODS.GET, getAPIURL('FAVORITES', 'LIST')),
        
    addFavorite: (menuItemId) => 
        request(HTTP_METHODS.POST, getAPIURL('FAVORITES', 'ADD'), { menuItemId }),
        
    removeFavorite: (favoriteId) => 
        request(HTTP_METHODS.DELETE, getAPIURL('FAVORITES', 'REMOVE', {}, favoriteId)),
        
    checkFavorite: (menuItemId) => 
        request(HTTP_METHODS.GET, getAPIURL('FAVORITES', 'CHECK', {}, menuItemId)),

    /**
     * MENU ENDPOINTS
     */
    getMenu: () => 
        request(HTTP_METHODS.GET, getAPIURL('MENU', 'LIST')),
        
    getMenuCategories: () => 
        request(HTTP_METHODS.GET, getAPIURL('MENU', 'CATEGORIES')),
        
    getMenuItems: () => 
        request(HTTP_METHODS.GET, getAPIURL('MENU', 'ITEMS')),
        
    getMenuItemDetails: (itemId) => 
        request(HTTP_METHODS.GET, getAPIURL('MENU', 'ITEM_DETAILS', {}, itemId)),
        
    checkAllergens: (ingredients) => 
        request(HTTP_METHODS.POST, getAPIURL('MENU', 'CHECK_ALLERGENS'), { ingredients }),
    
    // Admin menu CRUD operations
    createMenuItem: (menuItemData) => 
        request(HTTP_METHODS.POST, getAPIURL('MENU', 'CREATE'), menuItemData),
        
    updateMenuItem: (itemId, menuItemData) => 
        request(HTTP_METHODS.PUT, getAPIURL('MENU', 'UPDATE', {}, itemId), menuItemData),
        
    deleteMenuItem: (itemId) => 
        request(HTTP_METHODS.DELETE, getAPIURL('MENU', 'DELETE', {}, itemId)),
        
    updateMenuItemAvailability: (itemId, isAvailable) => 
        request(HTTP_METHODS.PUT, getAPIURL('MENU', 'UPDATE_AVAILABILITY', {}, itemId), { is_available: isAvailable }),
        
    updateMenuItemStatus: (itemId, isActive) => 
        request(HTTP_METHODS.PATCH, getAPIURL('MENU', 'UPDATE_STATUS', {}, itemId), { isActive }),
        
    updateMenuItemAllergens: (itemId, allergens) => 
        request(HTTP_METHODS.PUT, getAPIURL('MENU', 'UPDATE_ALLERGENS', {}, itemId), { allergens }),
        
    updateMenuItemDietaryRestrictions: (itemId, restrictionIds) => 
        request(HTTP_METHODS.PUT, getAPIURL('MENU', 'UPDATE_DIETARY', {}, itemId), { restrictionIds }),

    /**
     * ORDER ENDPOINTS
     */
    createOrder: (orderData) => 
        request(HTTP_METHODS.POST, getAPIURL('ORDERS', 'CREATE'), orderData),
        
    getOrders: () => 
        request(HTTP_METHODS.GET, getAPIURL('ORDERS', 'LIST')),
        
    getOrderDetails: (orderId) => 
        request(HTTP_METHODS.GET, getAPIURL('ORDERS', 'DETAILS', {}, orderId)),
        
    updateOrderStatus: (orderId, status) => 
        request(HTTP_METHODS.PUT, getAPIURL('WAITER', 'UPDATE_ORDER_STATUS', {}, orderId), { status }, { preventRedirect: true }),
        
    getOrderHistory: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('ORDERS', 'HISTORY'), params),
        
    reorderFromPrevious: (orderId) => 
        request(HTTP_METHODS.POST, getAPIURL('ORDERS', 'REORDER', {}, orderId)),

    /**
     * ANALYTICS ENDPOINTS     */
    getMenuPerformance: () => 
        request(HTTP_METHODS.GET, getAPIURL('ANALYTICS', 'MENU_PERFORMANCE')),
        
    getSalesTrends: () => 
        request(HTTP_METHODS.GET, getAPIURL('ANALYTICS', 'SALES_TRENDS')),
        
    getCustomerInsights: () => 
        request(HTTP_METHODS.GET, getAPIURL('ANALYTICS', 'CUSTOMER_INSIGHTS')),
    
    getSalesAnalytics: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('ANALYTICS', 'SALES'), params),
        
    getSalesByCategory: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('ANALYTICS', 'SALES_BY_CATEGORY'), params),
        
    getPopularItems: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('ANALYTICS', 'POPULAR_ITEMS'), params),
        
    getPeakHours: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('ANALYTICS', 'PEAK_HOURS'), params),
        
    getRevenueByCategory: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('ANALYTICS', 'REVENUE_BY_CATEGORY'), params),
        
    getCustomerDemographics: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('ANALYTICS', 'CUSTOMER_DEMOGRAPHICS'), params),
        
    getOrderPatterns: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('ANALYTICS', 'ORDER_PATTERNS'), params),
        
    getSalesForecast: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('ANALYTICS', 'SALES_FORECAST'), params),
    
    getPerformanceAnalytics: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('ANALYTICS', 'PERFORMANCE'), params),
        
    getInventoryTurnover: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('ANALYTICS', 'INVENTORY_TURNOVER'), params),
    
    getComprehensiveReports: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('ANALYTICS', 'COMPREHENSIVE_REPORTS'), params),
    
    generateTestData: () => 
        request(HTTP_METHODS.GET, getAPIURL('ANALYTICS', 'GENERATE_TEST_DATA')),
        
    getCustomerWiseOrders: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('REPORTS', 'CUSTOMER_WISE_ORDERS'), params),
        
    getCategoryWiseSales: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('REPORTS', 'CATEGORY_WISE_SALES'), params),
        
    getCustomerWiseFeedback: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('REPORTS', 'CUSTOMER_WISE_FEEDBACK'), params),
        
    getDateRangeWiseSales: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('REPORTS', 'DATE_RANGE_WISE_SALES'), params),
        
    getInventoryDetails: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('REPORTS', 'INVENTORY_DETAILS'), params),
        
    getCustomerContacts: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('REPORTS', 'CUSTOMER_CONTACTS'), params),

    /**
     * INVENTORY ENDPOINTS
     */
    getInventory: () => 
        request(HTTP_METHODS.GET, getAPIURL('INVENTORY', 'LIST')),
        
    createInventoryItem: (itemData) => 
        request(HTTP_METHODS.POST, getAPIURL('INVENTORY', 'CREATE'), itemData),
        
    updateInventoryItem: (itemData) => 
        request(HTTP_METHODS.PUT, getAPIURL('INVENTORY', 'UPDATE'), itemData),
        
    deleteInventoryItem: (itemId) => 
        request(HTTP_METHODS.DELETE, getAPIURL('INVENTORY', 'DELETE'), { itemId }),
        
    getInventoryAlerts: () => 
        request(HTTP_METHODS.GET, getAPIURL('INVENTORY', 'ALERTS')),
        
    getInventoryReport: () => 
        request(HTTP_METHODS.GET, getAPIURL('INVENTORY', 'REPORT')),
        
    getInventoryUsage: () => 
        request(HTTP_METHODS.GET, getAPIURL('INVENTORY', 'USAGE')),
        
    getInventoryUsageHistory: () => 
        request(HTTP_METHODS.GET, getAPIURL('INVENTORY', 'USAGE_HISTORY')),
        
    bulkUpdateInventory: (updates) => 
        request(HTTP_METHODS.POST, getAPIURL('INVENTORY', 'BULK_UPDATE'), { updates }),

    /**
     * PROMOTION ENDPOINTS
     */
    getPromotions: () => 
        request(HTTP_METHODS.GET, getAPIURL('PROMOTIONS', 'LIST')),
        
    createPromotion: (promoData) => 
        request(HTTP_METHODS.POST, getAPIURL('PROMOTIONS', 'CREATE'), promoData),
        
    updatePromotion: (promotionId, promoData) => 
        request(HTTP_METHODS.PUT, getAPIURL('PROMOTIONS', 'UPDATE', {}, promotionId), promoData),
        
    deletePromotion: (promotionId) => 
        request(HTTP_METHODS.DELETE, getAPIURL('PROMOTIONS', 'DELETE', {}, promotionId)),
        
    validatePromotion: (code) => 
        request(HTTP_METHODS.POST, getAPIURL('PROMOTIONS', 'VALIDATE'), { code }),
        
    getPromotionAnalytics: () => 
        request(HTTP_METHODS.GET, getAPIURL('PROMOTIONS', 'ANALYTICS')),

    /**
     * WAITER ENDPOINTS
     */
    getWaiterOrders: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('WAITER', 'ORDERS', params)),
        
    deliverOrder: (orderId) => 
        request(HTTP_METHODS.POST, getAPIURL('WAITER', 'DELIVER_ORDER'), { orderId }),
        
    getWaiterKitchenOrders: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('WAITER', 'KITCHEN_ORDERS', params)),
        
    updateWaiterOrderStatus: (orderId, status) => 
        request(HTTP_METHODS.PUT, getAPIURL('WAITER', 'UPDATE_ORDER_STATUS', {}, orderId), { status }, { preventRedirect: true }),

    updateWaiterKitchenOrderStatus: (kitchenOrderId, status) =>
        request(HTTP_METHODS.PUT, getAPIURL('WAITER', 'UPDATE_KITCHEN_ORDER_STATUS', {}, kitchenOrderId), { status }, { preventRedirect: true }),
        
    removeOrder: (orderId) => 
        request(HTTP_METHODS.DELETE, getAPIURL('WAITER', 'REMOVE_ORDER'), { orderId }, { preventRedirect: true }),
    
    getWaiterStats: () => 
        request(HTTP_METHODS.GET, getAPIURL('WAITER', 'STATS')),

    /**
     * KITCHEN ENDPOINTS
     */
    getKitchenOrders: (params = {}) => 
        request(HTTP_METHODS.GET, getAPIURL('KITCHEN', 'ORDERS', params)),        
    updateKitchenOrderStatus: (kitchenOrderId, status) => 
        request(HTTP_METHODS.PUT, getAPIURL('KITCHEN', 'UPDATE_ORDER_STATUS', {}, kitchenOrderId), { status }, { preventRedirect: true }),
        
    getKitchenStats: () => 
        request(HTTP_METHODS.GET, getAPIURL('KITCHEN', 'STATS')),



    /**
     * ADMIN ENDPOINTS
     */
    getAdminCustomers: () => 
        request(HTTP_METHODS.GET, getAPIURL('ADMIN', 'CUSTOMERS')),
        
    getAdminOrders: () => 
        request(HTTP_METHODS.GET, getAPIURL('ADMIN', 'ORDERS')),
        
    getAdminSalesSummary: () => 
        request(HTTP_METHODS.GET, getAPIURL('ADMIN', 'SALES_SUMMARY')),
        
    getAdminFeedbacks: () => 
        request(HTTP_METHODS.GET, getAPIURL('ADMIN', 'FEEDBACKS')),
        
    getAdminContactReports: () => 
        request(HTTP_METHODS.GET, getAPIURL('ADMIN', 'CONTACT_REPORTS')),

    /**
     * FEEDBACK ENDPOINTS
     */
    submitFeedback: (feedbackData) => 
        request(HTTP_METHODS.POST, getAPIURL('FEEDBACK', 'SUBMIT'), feedbackData),
        
    getFeedbackForOrder: (orderId) => 
        request(HTTP_METHODS.GET, getAPIURL('FEEDBACK', 'GET_FOR_ORDER', {}, orderId)),
        
    getUserFeedbacks: () => 
        request(HTTP_METHODS.GET, getAPIURL('FEEDBACK', 'GET_USER_FEEDBACKS')),
        
    getAllFeedbacks: () => 
        request(HTTP_METHODS.GET, getAPIURL('FEEDBACK', 'GET_ALL')),

    /**
     * CONTACT ENDPOINTS
     */
    submitContact: (contactData) => 
        request(HTTP_METHODS.POST, getAPIURL('CONTACT', 'SUBMIT'), contactData),
        
    getAllContacts: () => 
        request(HTTP_METHODS.GET, getAPIURL('CONTACT', 'GET_ALL')),

    /**
     * UTILITY FUNCTIONS
     */
    // Generic request method for custom endpoints
    _request: request
};

export default apiService;
