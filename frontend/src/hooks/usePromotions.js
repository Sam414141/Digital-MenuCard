import { useState } from 'react';
import apiService from '../services/apiService';

/**
 * Custom hook for promotion management
 */
export const usePromotions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPromotions = async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getPromotions(params);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createPromotion = async (promotionData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.createPromotion(promotionData);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updatePromotion = async (promotionId, updateData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.updatePromotion(promotionId, updateData);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deletePromotion = async (promotionId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.deletePromotion(promotionId);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const validatePromotion = async (code, orderTotal) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.validatePromotion(code, orderTotal);
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
        fetchPromotions,
        createPromotion,
        updatePromotion,
        deletePromotion,
        validatePromotion
    };
};