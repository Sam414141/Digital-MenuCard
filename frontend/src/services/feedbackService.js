/**
 * Feedback Service
 * Dedicated service for feedback-related API calls
 */

import apiService from './apiService';

const feedbackService = {
    /**
     * Submit feedback for an order
     * @param {Object} feedbackData - Feedback data including orderId, rating, comment, etc.
     * @returns {Promise} API response
     */
    submitFeedback: (feedbackData) => {
        return apiService.submitFeedback(feedbackData);
    },

    /**
     * Get feedback for a specific order
     * @param {string} orderId - Order ID
     * @returns {Promise} Feedback data
     */
    getFeedbackForOrder: (orderId) => {
        return apiService.getFeedbackForOrder(orderId);
    },

    /**
     * Get all feedback submitted by the current user
     * @returns {Promise} Array of user feedback
     */
    getUserFeedbacks: () => {
        return apiService.getUserFeedbacks();
    },

    /**
     * Get all feedback (admin only)
     * @returns {Promise} Array of all feedback
     */
    getAllFeedbacks: () => {
        return apiService.getAllFeedbacks();
    }
};

export default feedbackService;