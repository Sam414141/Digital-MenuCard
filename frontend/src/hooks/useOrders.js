import { useState, useCallback } from 'react';
import apiService from '../services/apiService';

/**
 * Custom hook for order management
 */
export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getOrderHistory(params);
            // Handle case where response might be undefined or not have the expected structure
            if (response && response.status === 'success' && response.data && Array.isArray(response.data.orders)) {
                setOrders(response.data.orders);
                return response;
            } else {
                // Return a default structure if response is not as expected
                setOrders([]);
                return { status: 'success', data: { orders: [] } };
            }
        } catch (err) {
            setError(err);
            // Also set orders to empty array on error to prevent UI issues
            setOrders([]);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createOrder = useCallback(async (orderData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.createOrder(orderData);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getOrderDetails = useCallback(async (orderId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getOrderDetails(orderId);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateOrderStatus = useCallback(async (orderId, status) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.updateOrderStatus(orderId, status);
            return response;
        } catch (err) {
            setError(err);
            // Prevent automatic redirection to unauthorized page for this specific call
            err.preventRedirect = true;
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const reorderFromPrevious = useCallback(async (orderId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.reorder(orderId);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Waiter-specific methods
    const getWaiterOrders = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getWaiterOrders(params);
            // The waiter orders endpoint returns a direct array, not wrapped in data object
            if (Array.isArray(response)) {
                setOrders(response);
                return response;
            } else {
                setOrders([]);
                return [];
            }
        } catch (err) {
            setError(err);
            setOrders([]);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Kitchen-specific methods
    const getKitchenScreenOrders = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getKitchenOrders(params);
            // Handle case where response might be undefined
            const validResponse = Array.isArray(response) ? response : [];
            setOrders(validResponse); // Update the orders state with kitchen orders
            return validResponse;
        } catch (err) {
            setError(err);
            // Set orders to empty array on error to prevent UI issues
            setOrders([]);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);
    
    const getWaiterKitchenOrders = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getWaiterKitchenOrders(params);
            // Handle case where response might be undefined
            const validResponse = Array.isArray(response) ? response : [];
            setOrders(validResponse); // Update the orders state with kitchen orders
            return validResponse;
        } catch (err) {
            setError(err);
            // Set orders to empty array on error to prevent UI issues
            setOrders([]);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);
    const updateKitchenOrderStatus = useCallback(async (kitchenOrderId, status) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.updateKitchenOrderStatus(kitchenOrderId, status);
            return response;
        } catch (err) {
            setError(err);
            // Prevent automatic redirection to unauthorized page for this specific call
            err.preventRedirect = true;
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateWaiterKitchenOrderStatus = useCallback(async (kitchenOrderId, status) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.updateWaiterKitchenOrderStatus(kitchenOrderId, status);
            return response;
        } catch (err) {
            setError(err);
            // Prevent automatic redirection to unauthorized page for this specific call
            err.preventRedirect = true;
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const removeOrderFromKitchen = useCallback(async (orderId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.removeOrder(orderId);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        orders,
        loading,
        error,
        fetchOrders,
        createOrder,
        getOrderDetails,
        updateOrderStatus,
        reorderFromPrevious,
        getWaiterOrders,
        getKitchenScreenOrders,
        getWaiterKitchenOrders,
        updateKitchenOrderStatus,
        updateWaiterKitchenOrderStatus,
        removeOrderFromKitchen
    };
};