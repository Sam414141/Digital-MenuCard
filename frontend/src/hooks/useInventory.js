import { useState } from 'react';
import apiService from '../services/apiService';

/**
 * Custom hook for inventory management
 */
export const useInventory = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchInventory = async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getInventory(params);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createInventoryItem = async (itemData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.createInventoryItem(itemData);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateInventoryItem = async (itemId, updateData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.updateInventoryItem(itemId, updateData);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteInventoryItem = async (itemId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.deleteInventoryItem(itemId);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getInventoryAlerts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getInventoryAlerts();
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getInventoryReport = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getInventoryReport();
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getInventoryUsageHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getInventoryUsageHistory();
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const bulkUpdateInventory = async (updates, supplierInfo) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.bulkUpdateInventory(updates, supplierInfo);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        fetchInventory,
        createInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        getInventoryAlerts,
        getInventoryReport,
        getInventoryUsageHistory,
        bulkUpdateInventory
    };
};