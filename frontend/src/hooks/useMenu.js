import { useState } from 'react';
import apiService from '../services/apiService';

/**
 * Custom hook for menu management
 */
export const useMenu = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMenuItems = async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getMenuItems(params);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchMenuCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getMenuCategories();
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getMenuItemDetails = async (itemId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getMenuItemDetails(itemId);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateMenuItemAllergens = async (itemId, allergens) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.updateMenuItemAllergens(itemId, allergens);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateMenuItemDietaryRestrictions = async (itemId, restrictionIds) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.updateMenuItemDietaryRestrictions(itemId, restrictionIds);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const checkAllergens = async (itemIds, allergens) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.checkAllergens(itemIds, allergens);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Admin CRUD operations
    const createMenuItem = async (menuItemData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.createMenuItem(menuItemData);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateMenuItem = async (itemId, menuItemData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.updateMenuItem(itemId, menuItemData);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteMenuItem = async (itemId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.deleteMenuItem(itemId);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateMenuItemAvailability = async (itemId, isAvailable) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.updateMenuItemAvailability(itemId, isAvailable);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateMenuItemStatus = async (itemId, isActive) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.updateMenuItemStatus(itemId, isActive);
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
        fetchMenuItems,
        fetchMenuCategories,
        getMenuItemDetails,
        updateMenuItemAllergens,
        updateMenuItemDietaryRestrictions,
        checkAllergens,
        createMenuItem,
        updateMenuItem,
        deleteMenuItem,
        updateMenuItemAvailability,
        updateMenuItemStatus
    };
};