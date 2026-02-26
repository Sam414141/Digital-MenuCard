import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EnhancedFeedbackForm from '../components/EnhancedFeedbackForm';
import { MessageSquare } from 'lucide-react';
import '../styles/OrderConfirmation.css'; // Import the CSS file

const EnhancedOrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { orderId, tableNumber } = location.state || {};
  
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const handleContinue = () => {
    navigate('/menu');
  };

  const handleFeedbackSuccess = () => {
    // Optionally show a success message or redirect
    console.log('Feedback submitted successfully');
  };

  if (!orderId || !tableNumber) {
    return (
      <div className="order-confirmation-page">
        <Navbar />
        <div className="container">
          <div className="confirmation-card">
            <div className="confirmation-icon error">⚠️</div>
            <h2>Order Information Missing</h2>
            <p>Unable to retrieve order details. Please check your order history.</p>
            <button className="btn btn-primary" onClick={handleContinue}>
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <Navbar />
      <div className="container">
        <div className="confirmation-card">
          <div className="confirmation-icon success">✅</div>
          <h2>Order Confirmed!</h2>
          <p>Thank you for your order. Your food will be prepared shortly.</p>
          
          <div className="order-details">
            <div className="detail-item">
              <span className="label">Order ID:</span>
              <span className="value">#{orderId}</span>
            </div>
            <div className="detail-item">
              <span className="label">Table Number:</span>
              <span className="value">#{tableNumber}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className="value status-pending">Pending</span>
            </div>
          </div>
          
          <div className="instructions">
            <h3>What's Next?</h3>
            <ul>
              <li>Your order is being prepared by our kitchen staff</li>
              <li>You can track your order status in real-time</li>
              <li>Our staff will notify you when your order is ready</li>
            </ul>
          </div>
          
          <div className="actions">
            <button className="btn btn-primary" onClick={handleContinue}>
              Continue Ordering
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/orders')}>
              View Order History
            </button>
            <button 
              className="btn btn-feedback"
              onClick={() => setShowFeedbackForm(true)}
            >
              <MessageSquare size={16} />
              Share Feedback
            </button>
          </div>
        </div>
      </div>

      <EnhancedFeedbackForm
        orderId={orderId}
        tableNumber={tableNumber}
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
        onSubmitSuccess={handleFeedbackSuccess}
      />
    </div>
  );
};

export default EnhancedOrderConfirmation;