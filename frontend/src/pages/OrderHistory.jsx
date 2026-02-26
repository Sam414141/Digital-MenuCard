import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
import EnhancedFeedbackForm from '../components/EnhancedFeedbackForm';
import { MessageSquare } from 'lucide-react';
import './OrderHistory.css';

const OrderHistory = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [reorderLoading, setReorderLoading] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const itemsPerPage = 10;

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [isAuthenticated, navigate, currentPage, statusFilter]);



    // Fetch orders every 30 seconds for real-time updates (reduced frequency to avoid rate limiting)
    useEffect(() => {
        const interval = setInterval(() => {
            fetchOrders();
        }, 30000); // Refresh every 30 seconds
        
        return () => clearInterval(interval);
    }, [currentPage, statusFilter]);

    /**
     * Fetch user's order history from backend
     */
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page: currentPage.toString(),
                limit: itemsPerPage.toString()
            };

            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            const response = await apiService.getOrderHistory(params);
            
            // Debugging: Log the response to see its structure
            console.log('Order history response:', response);
            
            if (response && response.status === 'success') {
                // Ensure we have an array of orders
                const ordersData = Array.isArray(response.data.orders) 
                    ? response.data.orders 
                    : [];
                setOrders(ordersData);
                setTotalPages(response.data.pagination?.totalPages || 1);
            } else {
                throw new Error(response?.message || 'Failed to fetch orders');
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            // Provide more informative error messages
            if (err.response) {
                // Handle rate limiting specifically
                if (err.response.status === 429) {
                    setError('Too many requests. Please wait a moment before trying again.');
                    // Temporarily increase the interval to avoid further rate limiting
                    setTimeout(() => setError(null), 5000);
                }
                // Server responded with error status
                else {
                    setError(`Server error: ${err.response.status} - ${err.response.statusText}`);
                }
            } else if (err.request) {
                // Request was made but no response received
                setError('Network error: Unable to connect to server');
            } else {
                // Something else happened
                setError(err.message || 'Failed to load order history');
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * Get order details for a specific order
     */
    const fetchOrderDetails = async (orderId) => {
        try {
            const response = await apiService.getOrderDetails(orderId);
            if (response && response.status === 'success' && response.data && response.data.order) {
                setSelectedOrder(response.data.order);
                setShowOrderDetails(true);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
            setError('Failed to load order details');
        }
    };

    /**
     * Start real-time tracking for an order
     */
    const startOrderTracking = async (orderId) => {
        setTrackingLoading(true);
        try {
            // Navigate to the dedicated order tracking page
            navigate(`/order-tracking/${orderId}`);
        } catch (err) {
            console.error('Error starting order tracking:', err);
            setError('Failed to start order tracking: ' + (err.message || ''));
        } finally {
            setTrackingLoading(false);
        }
    };

    /**
     * Reorder items from a previous order
     */
    const handleReorder = async (orderId) => {
        try {
            setReorderLoading(orderId);
            
            const response = await apiService.reorderFromPrevious(orderId);
            
            if (response && response.status === 'success' && response.data && response.data.items) {
                // Add items to cart (you'll need to integrate with your cart context)
                const items = response.data.items;
                
                // For now, navigate to cart with a success message
                // You can integrate this with your existing cart context
                navigate('/cart', { 
                    state: { 
                        reorderedItems: items,
                        message: 'Items from your previous order have been added to your cart!'
                    }
                });
            } else {
                throw new Error(response?.message || 'Failed to reorder');
            }
        } catch (err) {
            console.error('Error reordering:', err);
            setError(err.message || 'Failed to reorder items');
        } finally {
            setReorderLoading(null);
        }
    };

    const handleFeedbackClick = (orderId) => {
        setSelectedOrderId(orderId);
        setShowFeedbackForm(true);
    };

    const handleFeedbackSuccess = () => {
        console.log('Feedback submitted successfully for order:', selectedOrderId);
        setShowFeedbackForm(false);
        setSelectedOrderId(null);
    };

    /**
     * Get order progress step index
     */
    const getOrderProgress = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 0;
                case 'preparing':
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
                case 'preparing':
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
                case 'preparing':
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
                case 'preparing':
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
                return { color: 'pending', icon: Clock, text: 'Pending' };
                case 'preparing':
                    return { color: 'preparing', icon: Package, text: 'Preparing' };
                case 'prepaired':
                    return { color: 'prepaired', icon: CheckCircle, text: 'Prepaired' };
            case 'delivered':
                return { color: 'delivered', icon: Truck, text: 'Delivered' };
            case 'completed':
                return { color: 'completed', icon: CheckCircle, text: 'Completed' };
            case 'served':
                return { color: 'prepared', icon: CheckCircle, text: 'Served' };
            case 'cancelled':
                return { color: 'cancelled', icon: AlertCircle, text: 'Cancelled' };
            default:
                return { color: 'pending', icon: Clock, text: status };
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

    /**
     * Filter orders based on search term
     */
    const filteredOrders = orders.filter(order => {
        if (!searchTerm) return true;
        if (!order) return false;
        
        const searchLower = searchTerm.toLowerCase();
        const orderId = order.id?.toString() || '';
        const orderStatus = order.status?.toLowerCase() || '';
        const items = order.items || [];
        
        return (
            orderId.includes(searchLower) ||
            items.some(item => 
                (item.itemName || item.item_name || '').toLowerCase().includes(searchLower)
            ) ||
            orderStatus.includes(searchLower)
        );
    });

    /**
     * Render order item card
     */
    const renderOrderCard = (order) => {
        // Guard clauses for missing data
        if (!order) return null;
        
        const status = order.status || 'pending';
        const statusInfo = getStatusInfo(status);
        const StatusIcon = statusInfo.icon;
        const items = Array.isArray(order.items) ? order.items : [];
        const totalAmount = order.totalAmount || order.total_price || 0;
        const createdAt = order.createdAt || order.created_at || new Date();
        const orderId = order.id || order._id || 'N/A';
        
        return (
            <div key={orderId} className="order-card">
                <div className="order-header">
                    <div className="order-info">
                        <h3 className="order-id">Order #{orderId?.toString().substring(0, 8) || 'N/A'}</h3>
                        <p className="order-date">
                            <Calendar size={16} />
                            {formatDate(createdAt)}
                        </p>
                    </div>
                    <div className={`order-status ${statusInfo.color}`}>
                        <StatusIcon size={16} />
                        <span>{statusInfo.text}</span>
                    </div>
                </div>

                <div className="order-details">
                    <div className="order-items">
                        <h4>Items ({items.length}):</h4>
                        <div className="items-preview">
                            {items.slice(0, 3).map((item, index) => (
                                <span key={index} className="item-preview">
                                    {item.quantity || item.qty || 1}x {item.itemName || item.item_name || 'Unknown Item'}
                                </span>
                            ))}
                            {items.length > 3 && (
                                <span className="more-items">
                                    +{items.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="order-total">
                        <span>₹{parseFloat(totalAmount).toFixed(2)}</span>
                    </div>
                </div>

                <div className="order-actions">
                    <button 
                        className="btn-secondary"
                        onClick={() => startOrderTracking(orderId)}
                        disabled={trackingLoading}
                    >
                        {trackingLoading ? (
                            <>
                                <Loader size={16} className="spin" />
                                Tracking...
                            </>
                        ) : (
                            <>
                                <Eye size={16} />
                                Track Order
                            </>
                        )}
                    </button>
                    <button 
                        className="btn-feedback"
                        onClick={() => handleFeedbackClick(orderId)}
                    >
                        <MessageSquare size={16} />
                        Feedback
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="order-history-page">
            <Navbar />
            
            <main className="order-history-container">
                <div className="order-history-header">
                    <div>
                        <h1>Order History</h1>
                        <p>View and manage your past orders</p>
                    </div>
                    <button className="btn-secondary" onClick={fetchOrders} disabled={loading}>
                        <RotateCcw size={16} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="error-banner">
                        {error}
                    </div>
                )}

                <div className="order-history-controls">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search by order ID, item name, or status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    
                    <div className="filter-container">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="in progress">In Progress</option>
                            <option value="prepaired">Prepaired</option>
                            <option value="delivered">Delivered</option>
                            <option value="completed">Completed</option>
                            <option value="served">Served</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <Loader size={48} className="spin" />
                        <h3>Loading Your Orders</h3>
                        <p>Please wait while we fetch your order history...</p>
                    </div>
                ) : (
                    <>
                        <div className="orders-list">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map(renderOrderCard)
                            ) : (
                                <div className="no-orders">
                                    <div className="no-orders-icon">
                                        <ShoppingBag size={64} />
                                    </div>
                                    <h3>No Orders Found</h3>
                                    <p>
                                        {searchTerm || statusFilter !== 'all' 
                                            ? 'No orders match your search criteria. Try adjusting your filters.' 
                                            : 'You haven\'t placed any orders yet. Start ordering delicious food today!'}
                                    </p>
                                    <button 
                                        className="btn-primary"
                                        onClick={() => navigate('/menu')}
                                    >
                                        <Menu size={16} />
                                        Browse Menu
                                    </button>
                                </div>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>
                                
                                <span className="pagination-info">
                                    Page {currentPage} of {totalPages}
                                </span>
                                
                                <button
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            {showOrderDetails && selectedOrder && (
                <div className="modal-overlay" onClick={() => setShowOrderDetails(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Order Details</h2>
                            <button 
                                className="close-btn"
                                onClick={() => setShowOrderDetails(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="order-detail-header">
                                <div>
                                    <h3>Order #{selectedOrder.id}</h3>
                                    <p className="order-date">
                                        <Calendar size={16} />
                                        {formatDate(selectedOrder.createdAt)}
                                    </p>
                                </div>
                                <div className={`order-status ${getStatusInfo(selectedOrder.status).color}`}>
                                    <span>{getStatusInfo(selectedOrder.status).text}</span>
                                </div>
                            </div>

                            <div className="order-detail-items">
                                <h4>Items:</h4>
                                {selectedOrder.items.map((item, index) => (
                                    <div key={index} className="order-detail-item">
                                        <div className="item-info">
                                            <span className="item-name">{item.itemName}</span>
                                            <span className="item-price">₹{item.price.toFixed(2)}</span>
                                            

                                        </div>
                                        <div className="item-quantity">
                                            Quantity: {item.quantity}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-detail-summary">
                                <div className="summary-row">
                                    <span>Subtotal:</span>
                                    <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax:</span>
                                    <span>₹{selectedOrder.tax.toFixed(2)}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total:</span>
                                    <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}



            <EnhancedFeedbackForm
                orderId={selectedOrderId}
                tableNumber={null} // Will be fetched or passed from order data
                isOpen={showFeedbackForm}
                onClose={() => {
                    setShowFeedbackForm(false);
                    setSelectedOrderId(null);
                }}
                onSubmitSuccess={handleFeedbackSuccess}
            />

            <Footer />
        </div>
    );
};

export default OrderHistory;