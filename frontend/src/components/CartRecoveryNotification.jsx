import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import './CartRecoveryNotification.css';

const CartRecoveryNotification = () => {
    const { cartRecovered } = useContext(CartContext);

    if (!cartRecovered) return null;

    return (
        <div className="cart-recovery-notification">
            <div className="notification-content">
                <span className="notification-icon">🛒</span>
                <span className="notification-text">
                    Your cart has been restored!
                </span>
            </div>
        </div>
    );
};

export default CartRecoveryNotification;