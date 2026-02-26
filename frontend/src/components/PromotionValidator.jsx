import React, { useState } from 'react';
import { Tag, Check, X, AlertTriangle, Percent, IndianRupee, Gift } from 'lucide-react';
import apiService from '../services/apiService'; // Use apiService instead of axios
import './PromotionValidator.css';

const PromotionValidator = ({ cartItems, orderTotal, onPromotionApplied, onPromotionRemoved }) => {
    const [promotionCode, setPromotionCode] = useState('');
    const [validating, setValidating] = useState(false);
    const [appliedPromotion, setAppliedPromotion] = useState(null);
    const [availablePromotions, setAvailablePromotions] = useState([]);
    const [showAvailable, setShowAvailable] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchAvailablePromotions = async () => {
        try {
            // Use apiService instead of direct axios call
            const response = await apiService.getPromotions();
            setAvailablePromotions(response.filter(promo => promo.is_active));
            setShowAvailable(true);
        } catch (error) {
            console.error('Error fetching promotions:', error);
        }
    };

    const validatePromotion = async (promotionId) => {
        try {
            setValidating(true);
            setMessage({ type: '', text: '' });

            const menuItemIds = cartItems.map(item => item.id);
            
            // Use apiService instead of direct axios call
            const response = await apiService.validatePromotion(promotionId);
            if (response.data.valid) {
                const promotion = response.data;
                setAppliedPromotion(promotion);
                setMessage({ type: 'success', text: `Promotion "${promotion.promotion.name}" applied successfully!` });
                onPromotionApplied && onPromotionApplied(promotion);
                setPromotionCode('');
                setShowAvailable(false);
            }

        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Invalid promotion code';
            setMessage({ type: 'error', text: errorMessage });
            console.error('Validation error:', error);
        } finally {
            setValidating(false);
        }
    };

    const removePromotion = () => {
        setAppliedPromotion(null);
        setMessage({ type: '', text: '' });
        onPromotionRemoved && onPromotionRemoved();
    };

    const handleManualValidation = async () => {
        if (!promotionCode.trim()) {
            setMessage({ type: 'error', text: 'Please enter a promotion code' });
            return;
        }

        // For manual code entry, we need to find the promotion by name or implement a code field
        // For now, we'll validate by ID (you can enhance this to support actual codes)
        const promotionId = parseInt(promotionCode);
        if (isNaN(promotionId)) {
            setMessage({ type: 'error', text: 'Invalid promotion code format' });
            return;
        }

        await validatePromotion(promotionId);
    };

    const getDiscountIcon = (type) => {
        switch (type) {
            case 'percentage': return <Percent size={16} />;
            case 'fixed_amount': return <IndianRupee size={16} />;
            case 'buy_get': return <Gift size={16} />;
            default: return <Tag size={16} />;
        }
    };

    const formatDiscountValue = (type, value) => {
        switch (type) {
            case 'percentage': return `${value}% OFF`;
            case 'fixed_amount': return `₹${value} OFF`;
            case 'buy_get': return `Buy ${value} Get 1 FREE`;
            default: return value;
        }
    };

    return (
        <div className="promotion-validator">
            <div className="validator-header">
                <h3>
                    <Tag size={20} />
                    Promotions & Discounts
                </h3>
            </div>

            {/* Applied Promotion Display */}
            {appliedPromotion && (
                <div className="applied-promotion">
                    <div className="promotion-info">
                        <div className="promotion-badge">
                            {getDiscountIcon(appliedPromotion.promotion.discount_type)}
                            <span className="promotion-name">{appliedPromotion.promotion.name}</span>
                        </div>
                        <div className="discount-details">
                            <span className="discount-amount">
                                {formatDiscountValue(
                                    appliedPromotion.promotion.discount_type, 
                                    appliedPromotion.promotion.discount_value
                                )}
                            </span>
                            <span className="savings">
                                Save ₹{appliedPromotion.discount_amount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <button className="remove-btn" onClick={removePromotion}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Message Display */}
            {message.text && (
                <div className={`validation-message ${message.type}`}>
                    {message.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Promotion Code Input */}
            {!appliedPromotion && (
                <div className="promotion-input">
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Enter promotion code..."
                            value={promotionCode}
                            onChange={(e) => setPromotionCode(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleManualValidation()}
                        />
                        <button 
                            className="apply-btn"
                            onClick={handleManualValidation}
                            disabled={validating}
                        >
                            {validating ? 'Validating...' : 'Apply'}
                        </button>
                    </div>
                    
                    <button 
                        className="browse-btn"
                        onClick={fetchAvailablePromotions}
                    >
                        Browse Available Offers
                    </button>
                </div>
            )}

            {/* Available Promotions */}
            {showAvailable && availablePromotions.length > 0 && (
                <div className="available-promotions">
                    <div className="available-header">
                        <h4>Available Promotions</h4>
                        <button 
                            className="close-available"
                            onClick={() => setShowAvailable(false)}
                        >
                            <X size={16} />
                        </button>
                    </div>
                    
                    <div className="promotions-list">
                        {availablePromotions.map(promotion => {
                            // Check if promotion is applicable based on minimum order value
                            const isApplicable = !promotion.minimum_order_value || 
                                               orderTotal >= promotion.minimum_order_value;

                            return (
                                <div 
                                    key={promotion.id} 
                                    className={`promotion-option ${!isApplicable ? 'disabled' : ''}`}
                                >
                                    <div className="promotion-content">
                                        <div className="promotion-header">
                                            <div className="promotion-icon">
                                                {getDiscountIcon(promotion.discount_type)}
                                            </div>
                                            <div className="promotion-details">
                                                <h5>{promotion.name}</h5>
                                                <span className="discount-value">
                                                    {formatDiscountValue(promotion.discount_type, promotion.discount_value)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {promotion.description && (
                                            <p className="promotion-description">
                                                {promotion.description}
                                            </p>
                                        )}
                                        
                                        <div className="promotion-conditions">
                                            {promotion.minimum_order_value && (
                                                <span className="condition">
                                                    Min order: ₹{promotion.minimum_order_value}
                                                </span>
                                            )}
                                            <span className="condition">
                                                Valid until {new Date(promotion.valid_to).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        className="select-btn"
                                        onClick={() => validatePromotion(promotion.id)}
                                        disabled={!isApplicable || validating}
                                    >
                                        {isApplicable ? 'Apply' : 'Min order not met'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* No Available Promotions */}
            {showAvailable && availablePromotions.length === 0 && (
                <div className="no-promotions">
                    <Tag size={32} />
                    <h4>No Active Promotions</h4>
                    <p>There are currently no active promotions available.</p>
                    <button onClick={() => setShowAvailable(false)}>
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default PromotionValidator;