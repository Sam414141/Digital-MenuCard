import React, { useState, useEffect } from 'react';
import './FeedbackSuccessNotification.css';

const FeedbackSuccessNotification = ({ isVisible, onClose }) => {
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

    if (!show) return null;

    return (
        <div className="feedback-success-notification">
            <div className="notification-content">
                <span className="notification-icon">😊</span>
                <span className="notification-text">
                    Thank you for your feedback!
                </span>
            </div>
        </div>
    );
};

export default FeedbackSuccessNotification;