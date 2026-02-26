import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { CartContext } from "../context/CartContext";
import apiService from "../services/apiService"; // Use apiService instead of axios
import "../styles/Cart.css";
import { useNavigate } from "react-router-dom";
import CartRecoveryNotification from "../components/CartRecoveryNotification";
import FeedbackSuccessNotification from "../components/FeedbackSuccessNotification"; // Import feedback notification
import OrderPlacementFlow from "../components/OrderPlacementFlow"; // Import the new component
import { useIpContext } from "../context/IpContext"; // Add this import
import { useAuth } from "../context/AuthContext"; // Import AuthContext

export default function Cart() {
  const { cart, setCart, addToCart, decreaseQuantity, clearCart, TableNumber, setTableNumber } = useContext(CartContext);
  const { user } = useAuth(); // Get user information from AuthContext
  const [showPopup, setShowPopup] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [closeBTN , setcloseBTN] = useState(false);
  const [progress, setProgress] = useState(0);
  const [orderId, setOrderId] = useState(0);
  const [custoId, setCustomerId] = useState(0);
  const [orderStatus, setOrderStatus] = useState("pending");
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [showFeedbackForm, setShowFeedbackForm] = useState(false); // State to show/hide feedback form
  const [feedbackMessage, setFeedbackMessage] = useState(""); // State for feedback message
  const [gmail, setGmail] = useState(""); // State for Gmail
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false); // State for feedback success notification
  const { ip } = useIpContext();
  const navigate = useNavigate();
  
  // New state for order placement flow
  const [useOrderFlow, setUseOrderFlow] = useState(false);

  function EndNav(){
    navigate("/menu");
  }

  useEffect(() => {
    if (orderId) {
      const interval = setInterval(() => {
        // Use apiService instead of direct axios call
        apiService._request('POST', `/orderstatus`, { orderId })
          .then(response => {
            if (response.data && response.data.length > 0) {
              const rawStatus = response.data[0].status.trim().toLowerCase(); // Normalize raw status

              // Map backend statuses to user-facing statuses
              // backend: pending | prepairing | prepaired | completed | served
              // UI: pending | confirmed | prepairing | prepaired | served
              let status = rawStatus;
              if (rawStatus === 'prepairing') status = 'preparing';
              else if (rawStatus === 'prepaired' || rawStatus === 'completed') status = 'prepaired';
              else if (rawStatus === 'served') status = 'served';

              setOrderStatus(status);

              // Update progress based on mapped status
              if (status === 'pending') {
                setProgress(25);
              } else if (status === 'confirmed') {
                setProgress(50);
              } else if (status === 'preparing') {
                setProgress(75);
              } else if (status === 'prepaired' || status === 'served') {
                setProgress(100);
                clearInterval(interval); // Stop polling when order is complete/served
              }
            }
          })
          .catch(error => {
            console.error("Error fetching order status:", error);
          });
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [orderId]);

  // Calculate total price
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  // Original order placement function (kept for backward compatibility)
  const handlePlaceOrder = () => setShowPopup(true);

  const startOrder = async () => {
    // Validate mobile number
    if (!/^\d{10}$/.test(mobileNumber)) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return; // Stop execution if validation fails
    }

    const orderData = {
      tableNumber: TableNumber,
      items: cart.map(({ id, name, quantity, price, customizations, itemKey }) => ({ 
        menuItemId: id, 
        quantity, 
        customizations: customizations || ""
      })),
    };

    apiService.createOrder(orderData)
      .then(response => {
        if (response.message === "Order created successfully") {
          alert("Order placed successfully!");
          setOrderId(response.order._id);
          // Note: The backend doesn't return customerId in this response
        } else {
          alert("Failed to place order: " + (response.error || response.message || "Unknown error"));
        }
      })
      .catch(error => {
        console.error("Order Placement Error:", error);
        alert("Failed to place order. Please try again.");
      });

    setOrderPlaced(true);
    setShowPopup(false);
    clearCart(); // Clear cart after placing order (this will also clear localStorage)

  };

  const handleFeedbackSubmit = () => {
    // Validate Gmail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gmail)) {
      alert("Please enter a valid Gmail address.");
      return;
    }
    
    // Use apiService instead of direct axios call
    apiService._request('POST', `/feedback`, {
      "customerId": custoId,
      "orderId": orderId,
      "email": gmail,
      "message": feedbackMessage,
      "userId": user ? user.id : null // Use id from user object
    })
    .then((response) => {
      if (response.data.status === "200") {
        setShowFeedbackSuccess(true); // Show success notification
        setShowFeedbackForm(false); // Close the feedback form
        setFeedbackMessage(""); // Clear feedback message
        setGmail(""); // Clear Gmail input
      } else {
        alert("Failed to submit feedback. Please try again.");
      }
    })
    .catch((error) => {
      console.error("Error submitting feedback:", error);
      alert("An error occurred while submitting feedback. Please try again.");
    });
  };

  // Render the order placement flow instead of the original cart content
  if (useOrderFlow && cart.length > 0) {
    return (
      <>
        <Navbar />
        <OrderPlacementFlow 
          cart={cart}
          totalPrice={totalPrice}
          clearCart={clearCart}
          TableNumber={TableNumber}
          setTableNumber={setTableNumber}
        />
      </>
    );
  }

  return (
    <>
      <CartRecoveryNotification />
      <Navbar />
      <div className="cart-page">
        {/* Cart Header */}
        <div className="cart-header">
          <div className="cart-title-section">
            <h1 className="cart-title">🛒 Your Cart</h1>
            <div className="table-badge">
              <span className="table-icon">🪑</span>
              <span className="table-text">Table {TableNumber}</span>
            </div>
          </div>
          {cart.length > 0 && (
            <div className="cart-summary-badge">
              <span className="item-count">{cart.length} item{cart.length > 1 ? 's' : ''}</span>
              <span className="total-price">₹{totalPrice}</span>
            </div>
          )}
        </div>

        {/* Cart Content */}
        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-content">
              <div className="empty-cart-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Add some delicious items from our menu!</p>
              <button 
                className="browse-menu-btn" 
                onClick={() => navigate('/menu')}
              >
                Browse Menu
              </button>
            </div>
          </div>
        ) : (
          <div className="cart-content">
            {/* Cart Items */}
            <div className="cart-items-container">
              {cart.map((item) => (
                <div key={item.itemKey} className="modern-cart-item">
                  <div className="item-image-section">
                    <img src={item.image} alt={item.name} className="modern-cart-img" />
                  </div>
                  
                  <div className="item-details-section">
                    <div className="item-header">
                      <h3 className="item-name">{item.name}</h3>
                      <div className="item-price">₹{item.price.toFixed(2)}</div>
                    </div>
                    
                    {item.customizations && (
                      <div className="modern-customization-details">
                        <div className="customization-header">
                          <span className="customization-icon">⚙️</span>
                          <span className="customization-title">Customizations</span>
                        </div>
                        <div className="customization-content">
                          {item.customizations.split(' | ').map((custom, index) => (
                            <span key={index} className="customization-tag">
                              {custom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="item-total">
                      <span className="total-label">Subtotal:</span>
                      <span className="total-value">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="item-controls-section">
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn decrease" 
                        onClick={() => decreaseQuantity(item.itemKey)}
                        title={item.quantity === 1 ? "Remove item from cart" : "Decrease quantity"}
                      >
                        {item.quantity === 1 ? '🗑️' : '-'}
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button 
                        className="quantity-btn increase" 
                        onClick={() => addToCart(item)}
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary and Actions */}
            <div className="order-section">
              <div className="order-summary">
                <h2>Order Summary</h2>
                <div className="summary-details">
                  <div className="summary-row">
                    <span className="label">Subtotal :</span>
                    <span className="value">₹{totalPrice}</span>
                  </div>
                  <div className="summary-row total cart-summary">
                    <span className="label">Total</span>
                    <span className="value">₹{totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="order-actions">
                <button 
                  className="place-order-btn" 
                  onClick={() => setUseOrderFlow(true)}
                >
                  Proceed to Checkout
                </button>
                <button 
                  className="continue-shopping-btn" 
                  onClick={() => navigate('/menu')}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Original popup and other UI elements remain unchanged */}
        {showPopup && (
          <div className="modern-overlay">
            <div className="modern-modal">
              <div className="modal-header">
                <h2>🍽️ Confirm Your Order</h2>
                <button 
                  className="modal-close-btn" 
                  onClick={() => setShowPopup(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <div className="customer-info-section">
                  <div className="table-info">
                    <span className="info-icon">🪑</span>
                    <span>Table {TableNumber}</span>
                  </div>
                  
                  <div className="input-group">
                    <label>Customer Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter your name" 
                      value={customerName} 
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="modern-input"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label>Mobile Number</label>
                    <input 
                      type="text" 
                      placeholder="Enter 10-digit mobile number" 
                      value={mobileNumber} 
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="modern-input"
                    />
                    {errorMessage && <p className="modern-error-message">{errorMessage}</p>}
                  </div>
                </div>
                
                <div className="order-review-section">
                  <h3>Order Review</h3>
                  <div className="order-items-review">
                    {cart.map((item) => (
                      <div key={item.itemKey} className="review-item">
                        <div className="review-item-header">
                          <span className="review-item-name">{item.name}</span>
                          <span className="review-item-qty">x{item.quantity}</span>
                          <span className="review-item-price">₹{item.price.toFixed(2)}</span>
                        </div>
                        {item.customizations && (
                          <div className="review-customizations">
                            {item.customizations.split(' | ').map((custom, index) => (
                              <span key={index} className="review-custom-tag">
                                {custom}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-total-section">
                    <div className="total-row">
                      <span>Total Amount</span>
                      <span className="total-amount">₹{totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowPopup(false)}>
                  Cancel
                </button>
                <button className="confirm-order-btn" onClick={startOrder}>
                  <span className="btn-icon">✅</span>
                  Confirm Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Tracking Section */}
        {orderPlaced && (
          <div className="order-tracking-container">
            <div className="tracking-card">
              <div className="tracking-header">
                <h3>📋 Order Tracking</h3>
                <div className="order-id-badge">Order #{orderId}</div>
              </div>
              
              <div className="status-section">
                <div className="status-text">
                  <span className="status-label">Status:</span>
                  <span className={`status-value ${orderStatus.replace(/\s+/g, '-').toLowerCase()}`}>
                    {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                  </span>
                </div>
                
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="progress-steps">
                    <div className={`step ${progress >= 33 ? 'completed' : ''}`}>Ordered</div>
                    <div className={`step ${progress >= 66 ? 'completed' : ''}`}>Preparing</div>
                    <div className={`step ${progress >= 100 ? 'completed' : ''}`}>Ready</div>
                  </div>
                </div>
              </div>
              
              {closeBTN && (
                <div className="completion-section">
                  <div className="completion-icon">🎉</div>
                  <h4>Your order is ready!</h4>
                  <p>Please collect your order from the counter.</p>
                  <button className="end-order-btn" onClick={EndNav}>
                    End Order
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback Form Modal */}
        {showFeedbackForm && (
          <div className="modern-overlay">
            <div className="modern-modal feedback-modal">
              <div className="modal-header">
                <h2>⭐ Share Your Experience</h2>
                <button 
                  className="modal-close-btn" 
                  onClick={() => setShowFeedbackForm(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <div className="feedback-info">
                  <div className="info-row">
                    <span className="info-label">Table:</span>
                    <span className="info-value">{TableNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Name:</span>
                    <span className="info-value">{customerName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Mobile:</span>
                    <span className="info-value">{mobileNumber}</span>
                  </div>
                </div>
                
                <div className="feedback-form">
                  <div className="input-group">
                    <label>Your Feedback</label>
                    <textarea
                      placeholder="Tell us about your dining experience..."
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      className="feedback-textarea"
                      rows="4"
                    ></textarea>
                  </div>
                  
                  <div className="input-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={gmail}
                      onChange={(e) => setGmail(e.target.value)}
                      className="modern-input"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowFeedbackForm(false)}>
                  Maybe Later
                </button>
                <button className="submit-feedback-btn" onClick={handleFeedbackSubmit}>
                  <span className="btn-icon">📨</span>
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Success Notification */}
        <FeedbackSuccessNotification 
          isVisible={showFeedbackSuccess}
          onClose={() => setShowFeedbackSuccess(false)}
        />
      </div>
    </>
  );
}