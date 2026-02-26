import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useIpContext } from '../context/IpContext';
import apiService from '../services/apiService';
import QRScanner from './QRScanner'; // Import the QR scanner component
import './OrderPlacementFlow.css'; // Import the CSS file

const OrderPlacementFlow = ({ cart, totalPrice, clearCart, TableNumber, setTableNumber }) => {
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { ip } = useIpContext();
  
  const [step, setStep] = useState('checkAuth'); // checkAuth, login, scanQR, confirmOrder, payment
  const [showScanner, setShowScanner] = useState(false);
  const [scannedResult, setScannedResult] = useState('');
  const [error, setError] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay'); // Auto-select Razorpay
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Available payment methods - only Razorpay (auto-selected)
  const paymentMethods = [
    { id: 'razorpay', name: 'Razorpay', icon: '💳', description: 'Secure online payments' }
  ];

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && isAuthenticated) {
      // User is logged in, check if table number is set
      if (TableNumber && TableNumber > 0) {
        setStep('confirmOrder');
      } else {
        setStep('scanQR');
      }
    } else if (!token) {
      // No token found, redirect to login
      setStep('login');
    } else {
      // Token exists but context says not authenticated, try to sync
      const syncAuth = async () => {
        try {
          const response = await apiService.getUserProfile();
          if (response.status === 'success') {
            // Token is valid, continue with order flow
            if (TableNumber && TableNumber > 0) {
              setStep('confirmOrder');
            } else {
              setStep('scanQR');
            }
          } else {
            setStep('login');
          }
        } catch (error) {
          console.error('Token exists but may be invalid, redirecting to login:', error);
          setStep('login');
        }
      };
      syncAuth();
    }
  }, [isAuthenticated, TableNumber]);

  // Periodically validate token to keep authentication status updated
  useEffect(() => {
    if (isAuthenticated) {
      const tokenCheckInterval = setInterval(async () => {
        // Don't check token during payment processing to avoid interruptions
        if (paymentProcessing || step === 'payment') {
          return;
        }
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('No token found, redirecting to login');
          setStep('login');
          return;
        }
        
        try {
          // Decode token to check expiration
          const payload = JSON.parse(atob(token.split('.')[1]));
          const exp = payload.exp * 1000; // Convert to milliseconds
          const now = Date.now();
          const timeUntilExpiry = exp - now;
          
          // If token expires in less than 1 minute, redirect to login
          if (timeUntilExpiry < 1 * 60 * 1000) {
            console.log('Token expired, redirecting to login');
            setStep('login');
            clearInterval(tokenCheckInterval);
          }
        } catch (error) {
          console.error('Error checking token:', error);
          setStep('login');
          clearInterval(tokenCheckInterval);
        }
      }, 30000); // Check every 30 seconds
      
      // Cleanup interval on unmount
      return () => clearInterval(tokenCheckInterval);
    }
  }, [isAuthenticated, paymentProcessing, step]);

  // Handle login completion
  const handleLoginSuccess = () => {
    // After successful login, check table number
    if (TableNumber && TableNumber > 0) {
      setStep('confirmOrder');
    } else {
      setStep('scanQR');
    }
  };

  // Handle QR scan result
  const handleScanResult = (result) => {
    if (result) {
      try {
        // Parse the QR code result to extract table number
        // Assuming the QR code contains just the table number
        const tableNum = parseInt(result, 10);
        if (!isNaN(tableNum) && tableNum > 0) {
          setTableNumber(tableNum);
          localStorage.setItem('digitalMenuTableNumber', tableNum.toString());
          setScannedResult(result);
          setShowScanner(false);
          setStep('confirmOrder');
        } else {
          setError('Invalid table number scanned. Please try again.');
        }
      } catch (err) {
        setError('Error processing QR code. Please try again.');
        console.error('QR Scan Error:', err);
      }
    }
  };

  // Handle QR scan error
  const handleScanError = (err) => {
    setError('Failed to scan QR code. Please try again.');
    console.error('QR Scan Error:', err);
  };

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if script is already loaded
      if (typeof window.Razorpay !== 'undefined') {
        return resolve(true);
      }
      
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        // Wait a bit for the script to initialize
        setTimeout(() => {
          resolve(typeof window.Razorpay !== 'undefined');
        }, 500);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        setTimeout(() => {
          resolve(typeof window.Razorpay !== 'undefined');
        }, 500);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Validate token freshness
  const validateTokenFreshness = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        return false;
      }

      // Check if token is about to expire (within 2 minutes)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const timeUntilExpiry = exp - now;

        // Allow token to be used if it has at least 2 minutes left
        // This accounts for the time it takes to process payment
        if (timeUntilExpiry < 2 * 60 * 1000) {
          console.warn('Token expiring soon, consider refreshing');
          return false;
        }

        return true;
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        return false;
      }
    } catch (error) {
      console.error('Token validation failed:', error.message);
      return false;
    }
  };

  // Process payment and create order with paid status
  const processPayment = async () => {
    // Check if user has a valid token in localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please login to complete payment');
      setStep('login');
      return;
    }

    // Validate token freshness before payment
    const isTokenFresh = await validateTokenFreshness();
    if (!isTokenFresh) {
      // Try to verify token with backend to see if it can be refreshed
      try {
        const response = await apiService.getUserProfile();
        if (response.status === 'success') {
          // Token is still valid with backend, continue with payment
          console.log('Token validated with backend, continuing with payment');
        } else {
          setError('Session expired. Please login again to complete payment.');
          setStep('login');
          return;
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        setError('Session expired. Please login again to complete payment.');
        setStep('login');
        return;
      }
    }
    
    // Double-check authentication context is in sync
    if (!isAuthenticated) {
      // If context says not authenticated but we have a token, try to refresh
      try {
        const response = await apiService.getUserProfile();
        if (response.status === 'success') {
          console.log('Auth context may need refresh, but token is valid, continuing with payment');
        }
      } catch (error) {
        console.error('Token exists but context may be outdated:', error);
        // If we have a token but context is out of sync, clear it to force refresh
        localStorage.removeItem('authToken');
        setStep('login');
      }
    }
    
    // Automatically use Razorpay as the only payment method
    const selectedPaymentMethod = 'razorpay';
    
    setPaymentProcessing(true);
    setPaymentError('');
    setError('');
    setPaymentSuccess(false);

    try {

      if (selectedPaymentMethod === 'razorpay') {
        // For Razorpay, create a temporary payment order first
        const razorpayOrderResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/payments/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            amount: totalPrice
          })
        });
        
        const razorpayOrderData = await razorpayOrderResponse.json();
        
        if (razorpayOrderResponse.ok && razorpayOrderData.status === 'success') {
          // Load Razorpay SDK
          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded || typeof window.Razorpay === 'undefined') {
            throw new Error('Razorpay SDK failed to load. Please check your connection.');
          }

          // Open Razorpay checkout
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: razorpayOrderData.data.amount,
            currency: razorpayOrderData.data.currency,
            name: 'Digital Menu Card',
            description: 'Restaurant Order Payment',
            order_id: razorpayOrderData.data.orderId,
            handler: async function (response) {
              // Verify payment with our server
              const verifyResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/payments/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature
                })
              });
              
              const verifyData = await verifyResponse.json();
              
              if (verifyResponse.ok && verifyData.status === 'success') {
                // Payment verified successfully - NOW create the actual order
                const orderData = {
                  tableNumber: TableNumber,
                  items: cart.map(({ id, name, quantity, price, customizations, itemKey }) => ({ 
                    menuItemId: id, 
                    quantity, 
                    customizations: customizations || ""
                  })),
                  paymentStatus: 'completed',
                  paymentMethod: 'razorpay',
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id
                };
                
                try {
                  const orderResponse = await apiService.createOrder(orderData);
                  
                  if (orderResponse && orderResponse.message === "Order created successfully") {
                    const orderId = orderResponse.order._id;
                    
                    setPaymentSuccess(true);
                    setPaymentProcessing(false);
                                    
                    // Show success message briefly then navigate
                    setTimeout(() => {
                      clearCart();
                      navigate('/order-confirmation', {
                        state: {
                          orderId: orderId,
                          tableNumber: TableNumber
                        }
                      });
                    }, 1500);
                  } else {
                    throw new Error(orderResponse?.message || 'Failed to create order after payment');
                  }
                } catch (orderError) {
                  console.error('Error creating order after payment:', orderError);
                  setPaymentError('Payment successful but order creation failed. Please contact support.');
                  setPaymentProcessing(false);
                }
              } else {
                // Handle specific error cases
                let errorMessage = verifyData.message || 'Payment verification failed';
                                
                if (verifyData.message?.includes('Invalid token') || 
                    verifyData.message?.includes('Token expired') || 
                    verifyResponse.status === 401) {
                  // Clear the invalid token
                  localStorage.removeItem('authToken');
                  errorMessage = 'Session expired. Please login again and restart your order.';
                }
                                
                setPaymentError(errorMessage);
                setPaymentProcessing(false);
              }
            },
            prefill: {
              name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Customer',
              email: user?.email || '',
              contact: user?.phone?.replace(/\D/g, '') || '',
            },
            notes: {
              table_number: TableNumber
            },
            theme: {
              color: '#4CAF50',
            },
          };
          
          const rzp = new window.Razorpay(options);
          
          // Add event listeners for better UX
          rzp.on('payment.failed', function (response) {
            console.error('Payment failed:', response.error);
            setPaymentError('Payment failed. Please try again.');
            setPaymentProcessing(false);
          });
          
          rzp.open();
        } else {
          setError(razorpayOrderData.message || 'Failed to create payment order');
        }
      }
    } catch (err) {
      console.error('Payment Processing Error:', err);
      // Handle different types of errors with better error checking
      if (err && err.response) {
        // Server responded with error status
        const errorMessage = (err.response.data && (err.response.data.message || err.response.data.error)) || 
                            err.response.statusText || 
                            'Payment processing failed. Please try again.';
        setError(errorMessage);
      } else if (err && err.request) {
        // Request was made but no response received
        setError('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        setError('Payment processing failed. Please try again.');
      }
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Render the appropriate step
  const renderStep = () => {
    switch (step) {
      case 'login':
        return (
          <div className="auth-required">
            <h2>Authentication Required</h2>
            <p>Please log in to place your order.</p>
            <button onClick={() => navigate('/login')} className="btn btn-primary">
              Go to Login
            </button>
          </div>
        );

      case 'scanQR':
        return (
          <div className="qr-scan-step">
            <h2>Table Verification</h2>
            <p>Please scan the QR code at your table to verify your location.</p>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="qr-scanner-container">
              <QRScanner 
                onScanResult={handleScanResult}
                onError={handleScanError}
              />
            </div>
            
            {scannedResult && (
              <div className="scan-result">
                <p>Scanned Table: {scannedResult}</p>
                <button 
                  onClick={() => setStep('confirmOrder')} 
                  className="btn btn-success"
                >
                  Continue to Order Confirmation
                </button>
              </div>
            )}
          </div>
        );

      case 'confirmOrder':
        return (
          <div className="order-confirmation">
            <h2>Confirm Your Order</h2>
            
            <div className="order-summary-header">
              <h3 className="summary-title">Order Summary</h3>
            </div>
            
            <div className="order-details">
              <div className="table-info">
                <h3>Table #{TableNumber}</h3>
              </div>
              
              <div className="order-summary">
                <div className="summary-content">
                  <div className="summary-items-row">
                    {cart.map((item, index) => (
                      <div key={index} className="summary-item">
                        <div className="item-name">{item.name}</div>
                        <div className="item-details">
                          <span className="item-quantity">Qty: {item.quantity}</span>
                          <span className="item-price">₹{item.price.toFixed(2)} each</span>
                          <span className="item-total">Total: ₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="summary-total">
                    <span className="total-label">Total Amount:</span>
                    <span className="total-amount">₹{totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="confirmation-actions">
              <button 
                onClick={() => setStep('payment')} 
                className="btn btn-primary place-order-btn"
              >
                Proceed to Payment
              </button>
              <button 
                onClick={() => setStep('scanQR')} 
                className="btn btn-outline"
              >
                Change Table
              </button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="payment-step">
            <h2>Secure Payment</h2>
            <p>Complete your order with Razorpay secure payment gateway.</p>
            
            <div className="payment-methods">
              <h3>Payment Method</h3>
              <div className="payment-options">
                {/* Only Razorpay is available - auto-selected */}
                <div 
                  className="payment-option selected"
                  style={{ cursor: 'default', opacity: '1' }}
                >
                  <span className="payment-icon">{paymentMethods[0].icon}</span>
                  <span className="payment-name">{paymentMethods[0].name}</span>
                  <span className="payment-description">{paymentMethods[0].description}</span>
                </div>
              </div>
            </div>
            
            <div className="order-summary-payment">
              <h3>Order Summary</h3>
              <div className="summary-details">
                <div className="summary-row">
                  <span className="label">Subtotal</span>
                  <span className="value">₹{totalPrice}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Tax</span>
                  <span className="value">₹0.00</span>
                </div>
                <div className="summary-total">
                  <span className="total-label">Total Amount:</span>
                  <span className="total-amount">₹{totalPrice}</span>
                </div>
              </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {paymentError && (
              <div className="error-message payment-error">
                <strong>Payment Error:</strong> {paymentError}
                <button 
                  onClick={() => setPaymentError('')} 
                  className="close-error"
                >
                  ×
                </button>
              </div>
            )}
            
            {paymentSuccess && (
              <div className="success-message payment-success">
                <span className="success-icon">✓</span>
                <div className="success-content">
                  <h4>Payment Successful!</h4>
                  <p>Your order is being processed and will be prepared shortly.</p>
                </div>
              </div>
            )}
            
            <div className="payment-instructions">
              <p>After clicking "Pay Now", you will be redirected to Razorpay secure payment page.</p>
              <p>Your order will be confirmed upon successful payment.</p>
            </div>
            
            <div className="payment-actions">
              <button 
                onClick={processPayment} 
                disabled={paymentProcessing}
                className="btn btn-primary pay-btn"
              >
                {paymentProcessing ? (
                  <>
                    <span className="spinner"></span> Processing Payment...
                  </>
                ) : (
                  `Pay Now ₹${totalPrice}`
                )}
              </button>
              <button 
                onClick={() => setStep('confirmOrder')} 
                className="btn btn-outline"
                disabled={paymentProcessing}
              >
                Back to Order
              </button>
            </div>
            
            {paymentProcessing && (
              <div className="payment-processing">
                <div className="spinner"></div>
                <div className="processing-content">
                  <p>Redirecting to secure payment page...</p>
                  <small>Please do not close this page until payment is complete.</small>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="checking-auth">
            <p>Checking authentication status...</p>
          </div>
        );
    }
  };

  return (
    <div className="order-placement-flow">
      <br /><br />
      <div className="flow-container">
        <div className="flow-header">
          <h1>Order Placement</h1>
          <div className="progress-indicator">
            <div className={`step ${step === 'checkAuth' || step === 'login' ? 'active' : ''}`}>1</div>
            <div className={`step ${step === 'scanQR' ? 'active' : ''}`}>2</div>
            <div className={`step ${step === 'confirmOrder' ? 'active' : ''}`}>3</div>
            <div className={`step ${step === 'payment' ? 'active' : ''}`}>4</div>
          </div>
        </div>
        
        <div className="flow-content">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default OrderPlacementFlow;