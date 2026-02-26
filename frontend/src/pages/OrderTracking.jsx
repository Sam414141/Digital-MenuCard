import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIpContext } from '../context/IpContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import apiService from '../services/apiService';
import { 
    Clock, 
    ShoppingBag, 
    RotateCcw, 
    Eye, 
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    Calendar,
    IndianRupee,
    CheckCircle,
    AlertCircle,
    Loader,
    Package,
    MapPin,
    Timer,
    Truck,
    Circle,
    Check,
    Menu
} from 'lucide-react';
import './OrderTracking.css';

const OrderTracking = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { ip } = useIpContext(); // Get IP from context
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [trackingInterval, setTrackingInterval] = useState(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        
        if (orderId) {
            startOrderTracking(orderId);
        }
    }, [isAuthenticated, navigate, orderId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (trackingInterval) {
                clearInterval(trackingInterval);
            }

        };
    }, []);

    /**
     * Start real-time tracking for an order
     */
    const startOrderTracking = async (orderId) => {
        try {
            // Clear any existing interval
            if (trackingInterval) {
                clearInterval(trackingInterval);
                setTrackingInterval(null);
            }
            
            // Fetch initial order details
            const response = await apiService.getOrderDetails(orderId);
            if (response && response.status === 'success' && response.data && response.data.order) {
                setOrder(response.data.order);
                
                // Set up interval to fetch updates every 5 seconds for real-time updates
                const interval = setInterval(async () => {
                    try {
                        const updateResponse = await apiService.getOrderDetails(orderId);
                        if (updateResponse && updateResponse.status === 'success' && updateResponse.data && updateResponse.data.order) {
                            setOrder(updateResponse.data.order);
                        }
                    } catch (err) {
                        console.error('Error fetching order updates:', err);
                    }
                }, 5000);
                
                setTrackingInterval(interval);
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (err) {
            console.error('Error starting order tracking:', err);
            setError('Failed to start order tracking: ' + (err.message || ''));
        } finally {
            setLoading(false);
        }
    };















    /**
     * Get order progress step index
     */
    const getOrderProgress = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 0;
            case 'prepairing':
                return 1;
            case 'prepaired':
                return 2;
            case 'delivered':
            case 'completed':
            case 'served':
                return 3;
            case 'cancelled':
                return 0; // Reset progress for cancelled orders
            default:
                return 0;
        }
    };

    /**
     * Get simple progress percentage for the progress bar
     */
    const getSimpleProgressPercentage = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 25;
            case 'prepairing':
                return 50;
            case 'prepaired':
                return 75;
            case 'delivered':
            case 'completed':
            case 'served':
                return 100;
            case 'cancelled':
                return 0;
            default:
                return 0;
        }
    };

    /**
     * Get progress bar color based on status
     */
    const getProgressColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return '#f59e0b'; // amber
            case 'prepairing':
                return '#3b82f6'; // blue
            case 'prepaired':
                return '#10b981'; // emerald
            case 'served':
                return '#10b981'; // emerald (same as prepared)
            case 'delivered':
            case 'completed':
                return '#22c55e'; // green
            case 'cancelled':
                return '#ef4444'; // red
            default:
                return '#9ca3af'; // gray
        }
    };

    /**
     * Get progress description based on status
     */
    const getProgressDescription = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'Your order has been received and is pending processing.';
            case 'prepairing':
                return 'Your order is currently being prepared in the kitchen.';
            case 'prepaired':
                return 'Your order is ready and has been picked up by the waiter.';
            case 'delivered':
            case 'completed':
            case 'served':
                return 'Your order has been served. Enjoy your meal!';
            case 'cancelled':
                return 'Your order has been cancelled.';
            default:
                return 'Order status unknown.';
        }
    };

    /**
     * Get status badge color and icon
     */
    const getStatusInfo = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return { color: 'pending', icon: Clock, text: 'Pending' }
            case 'prepairing':
                return { color: 'preparing', icon: Package, text: 'Preparing' }
            case 'prepaired':
                return { color: 'prepared', icon: CheckCircle, text: 'Prepared' }
            case 'delivered':
                return { color: 'delivered', icon: Truck, text: 'Delivered' }
            case 'completed':
                return { color: 'completed', icon: CheckCircle, text: 'Completed' }
            case 'served':
                return { color: 'prepared', icon: CheckCircle, text: 'Served' }
            case 'cancelled':
                return { color: 'cancelled', icon: AlertCircle, text: 'Cancelled' }
            default:
                return { color: 'pending', icon: Clock, text: status }
        }
    };

    /**
     * Format date for display
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="order-tracking-page">
                <Navbar />
                <main className="order-tracking-container">
                    <div className="loading-container">
                        <Loader size={48} className="spin" />
                        <h3>Loading Order Tracking</h3>
                        <p>Please wait while we fetch your order details...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-tracking-page">
                <Navbar />
                <main className="order-tracking-container">
                    <div className="error-banner">
                        {error}
                    </div>
                    <button 
                        className="btn-primary"
                        onClick={() => navigate('/orders')}
                    >
                        Back to Order History
                    </button>
                </main>
                <Footer />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-tracking-page">
                <Navbar />
                <main className="order-tracking-container">
                    <div className="no-orders">
                        <div className="no-orders-icon">
                            <ShoppingBag size={64} />
                        </div>
                        <h3>Order Not Found</h3>
                        <p>We couldn't find the order you're looking for.</p>
                        <button 
                            className="btn-primary"
                            onClick={() => navigate('/orders')}
                        >
                            Back to Order History
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="order-tracking-page">
            <Navbar />
            
            <main className="order-tracking-container">
                <div className="order-tracking-header">
                    <div>
                        <h1>Order Tracking</h1>
                        <p>Real-time updates on your order status</p>
                    </div>
                    <button 
                        className="btn-secondary" 
                        onClick={() => startOrderTracking(orderId)}
                        disabled={loading}
                    >
                        <RotateCcw size={16} />
                        Refresh
                    </button>
                </div>

                <div className="order-tracking-content">
                    {/* Order Header */}
                    <div className="order-header">
                        <div className="order-info">
                            <h2 className="order-id">Order #{order.id?.toString().substring(0, 8) || 'N/A'}</h2>
                            <p className="order-date">
                                <Calendar size={16} />
                                {formatDate(order.createdAt || order.created_at)}
                            </p>
                        </div>
                        <div className={`order-status ${statusInfo.color}`}>
                            <statusInfo.icon size={16} />
                            <span>{statusInfo.text}</span>
                        </div>
                    </div>





                    {/* Progress Tracking */}
                    <div className="progress-tracking-section">
                        <h3>Order Progress</h3>
                        <div className="simple-progress-container">
                            {/* Top labels (positions 1 & 3) */}
                            <div className="progress-labels progress-labels-top">
                                <span className="progress-label">Pending</span>
                                <span className="progress-label empty" aria-hidden="true" />
                                <span className="progress-label">Prepared</span>
                                <span className="progress-label empty" aria-hidden="true" />
                            </div>

                            <div className="simple-progress-bar">
                                <div 
                                    className="simple-progress-fill"
                                    style={{ 
                                        width: `${getSimpleProgressPercentage(order.status)}%`,
                                        backgroundColor: getProgressColor(order.status)
                                    }}
                                ></div>
                            </div>

                            {/* Bottom labels (positions 2 & 4) */}
                            <div className="progress-labels progress-labels-bottom">
                                <span className="progress-label empty" aria-hidden="true" />
                                <span className="progress-label">Preparing</span>
                                <span className="progress-label empty" aria-hidden="true" />
                                <span className="progress-label">Served</span>
                            </div>
                            
                            <div className="progress-description">
                                {getProgressDescription(order.status)}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="order-items-section">
                        <h3>Order Items</h3>
                        <div className="order-items-list">
                            {order.items?.map((item, index) => {
                                const itemStatusInfo = getStatusInfo(item.status);
                                return (
                                    <div key={index} className="order-item">
                                        <div className="item-info">
                                            <h4>{item.itemName || item.item_name}</h4>
                                            <p className="item-quantity">Qty: {item.quantity || item.qty || 1}</p>
                                        </div>
                                        <div className="item-price">
                                            ₹{(item.price * (item.quantity || item.qty || 1)).toFixed(2)}
                                        </div>
                                        <div className={`item-status ${itemStatusInfo.color}`}>
                                            <itemStatusInfo.icon size={14} />
                                            <span>{itemStatusInfo.text}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary-section">
                        <h3>Order Summary</h3>
                        <div className="order-summary">
                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>₹{parseFloat(order.subtotal || 0).toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Tax:</span>
                                <span>₹{parseFloat(order.tax || 0).toFixed(2)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total:</span>
                                <span>₹{parseFloat(order.totalAmount || order.total_price || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="tracking-actions">
                    <button 
                        className="btn-secondary"
                        onClick={() => navigate('/orders')}
                    >
                        Back to Order History
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default OrderTracking;