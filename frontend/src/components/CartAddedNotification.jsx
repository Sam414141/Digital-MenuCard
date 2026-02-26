import React, { useState, useEffect } from 'react';
import './CartAddedNotification.css';

const CartAddedNotification = ({ itemName, isVisible, onClose }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShow(true);
            // Auto-hide after 3 seconds
            const timer = setTimeout(() => {
                setShow(false);
                if (onClose) onClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!show || !itemName) return null;

    return (
        <div className="cart-added-notification">
            <div className="notification-content">
                <span className="notification-icon">✅</span>
                <span className="notification-text">
                    {itemName} added to cart!
                </span>
            </div>
        </div>
    );
};

export default CartAddedNotification;