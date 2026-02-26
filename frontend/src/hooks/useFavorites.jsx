/**
 * Favorites Service
 * Handles all favorites-related operations with state management
 */

import { useState, useCallback } from 'react';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for managing favorites
 * @returns {object} Favorites state and methods
 */
export const useFavorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuth();

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Fetch user's favorites
     */
    const fetchFavorites = useCallback(async () => {
        if (!isAuthenticated) {
            setFavorites([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const response = await apiService.getFavorites();
            
            if (response.status === 'success') {
                setFavorites(response.data.favorites);
            } else {
                throw new Error(response.message || 'Failed to fetch favorites');
            }
        } catch (err) {
            console.error('Error fetching favorites:', err);
            setError(err.message || 'Failed to load favorites');
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    /**
     * Add item to favorites
     * @param {number} menuItemId - Menu item ID
     * @param {string} customizations - Item customizations
     * @returns {Promise} Operation result
     */
    const addToFavorites = useCallback(async (menuItemId, customizations = '') => {
        if (!isAuthenticated) {
            throw new Error('You must be logged in to add favorites');
        }

        try {
            setError(null);
            
            const response = await apiService.addFavorite(menuItemId);
            
            if (response.status === 'success') {
                // Refresh favorites list
                await fetchFavorites();
                return { success: true, message: 'Item added to favorites' };
            } else {
                throw new Error(response.message || 'Failed to add to favorites');
            }
        } catch (err) {
            console.error('Error adding to favorites:', err);
            const errorMessage = err.message || 'Failed to add to favorites';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [isAuthenticated, fetchFavorites]);

    /**
     * Remove item from favorites
     * @param {number} favoriteId - Favorite item ID
     * @returns {Promise} Operation result
     */
    const removeFromFavorites = useCallback(async (favoriteId) => {
        if (!isAuthenticated) {
            throw new Error('You must be logged in to remove favorites');
        }

        try {
            setError(null);
            
            const response = await apiService.removeFavorite(favoriteId);
            
            if (response.status === 'success') {
                // Update local state by removing the item
                setFavorites(prev => prev.filter(fav => fav.favoriteId !== favoriteId));
                return { success: true, message: 'Item removed from favorites' };
            } else {
                throw new Error(response.message || 'Failed to remove from favorites');
            }
        } catch (err) {
            console.error('Error removing from favorites:', err);
            const errorMessage = err.message || 'Failed to remove from favorites';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [isAuthenticated]);

    /**
     * Check if item is favorited
     * @param {number} menuItemId - Menu item ID
     * @param {string} customizations - Item customizations
     * @returns {Promise} Check result
     */
    const checkFavoriteStatus = useCallback(async (menuItemId, customizations = '') => {
        if (!isAuthenticated) {
            return { isFavorited: false, favoriteId: null };
        }

        try {
            const response = await apiService.checkFavorite(menuItemId);
            
            if (response.status === 'success') {
                return response.data;
            } else {
                return { isFavorited: false, favoriteId: null };
            }
        } catch (err) {
            console.error('Error checking favorite status:', err);
            return { isFavorited: false, favoriteId: null };
        }
    }, [isAuthenticated]);

    /**
     * Toggle favorite status of an item
     * @param {number} menuItemId - Menu item ID
     * @param {string} customizations - Item customizations
     * @param {number} currentFavoriteId - Current favorite ID if favorited
     * @returns {Promise} Toggle result
     */
    const toggleFavorite = useCallback(async (menuItemId, customizations = '', currentFavoriteId = null) => {
        if (!isAuthenticated) {
            return { success: false, error: 'You must be logged in to manage favorites' };
        }

        try {
            if (currentFavoriteId) {
                // Remove from favorites
                return await removeFromFavorites(currentFavoriteId);
            } else {
                // Add to favorites
                return await addToFavorites(menuItemId, customizations);
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
            return { success: false, error: err.message || 'Failed to update favorites' };
        }
    }, [isAuthenticated, addToFavorites, removeFromFavorites]);

    /**
     * Get favorite item by menu item ID and customizations
     * @param {number} menuItemId - Menu item ID
     * @param {string} customizations - Item customizations
     * @returns {object|null} Favorite item or null
     */
    const getFavoriteByItem = useCallback((menuItemId, customizations = '') => {
        return favorites.find(fav => 
            fav.item.id === menuItemId && 
            fav.customizations === customizations
        ) || null;
    }, [favorites]);

    /**
     * Check if specific item is favorited (from local state)
     * @param {number} menuItemId - Menu item ID
     * @param {string} customizations - Item customizations
     * @returns {boolean} Is favorited
     */
    const isItemFavorited = useCallback((menuItemId, customizations = '') => {
        return !!getFavoriteByItem(menuItemId, customizations);
    }, [getFavoriteByItem]);

    return {
        // State
        favorites,
        loading,
        error,
        
        // Methods
        fetchFavorites,
        addToFavorites,
        removeFromFavorites,
        checkFavoriteStatus,
        toggleFavorite,
        getFavoriteByItem,
        isItemFavorited,
        clearError,
        
        // Computed values
        favoritesCount: favorites.length,
        hasFavorites: favorites.length > 0
    };
};

/**
 * Favorites Context Provider (optional - for global state)
 */
import React, { createContext, useContext, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavoritesContext = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavoritesContext must be used within a FavoritesProvider');
    }
    return context;
};

export const FavoritesProvider = ({ children }) => {
    const favoritesState = useFavorites();
    const { isAuthenticated } = useAuth();

    // Auto-fetch favorites when user logs in
    useEffect(() => {
        if (isAuthenticated) {
            favoritesState.fetchFavorites();
        }
    }, [isAuthenticated, favoritesState.fetchFavorites]);

    return (
        <FavoritesContext.Provider value={favoritesState}>
            {children}
        </FavoritesContext.Provider>
    );
};

export default useFavorites;