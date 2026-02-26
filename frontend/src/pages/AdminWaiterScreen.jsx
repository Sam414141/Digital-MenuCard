import React, { useEffect, useState, useCallback } from "react";
import "../styles/WaiterScreen.css"; // Import the CSS file
import AdminNavbar from "../components/AdminNavbar"; // Use admin navbar
import { useOrders } from '../hooks/useOrders'; // Import the orders hook
import useApiUrl from '../hooks/useApiUrl';
import useIPMonitor from '../hooks/useIPMonitor'; // Add IP monitoring
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminWaiterScreen = () => {
    const [orders, setOrders] = useState([]);
    const [currentDateTime, setCurrentDateTime] = useState({
        date: "",
        time: "",
    });
    const [error, setError] = useState(null);

    const { buildUrl } = useApiUrl();
    const { fetchOrders, updateOrderStatus, getWaiterOrders, getWaiterKitchenOrders, updateWaiterKitchenOrderStatus } = useOrders(); // Use the orders hook
    
    // Add IP monitoring to automatically detect IP changes
    useIPMonitor(30000); // Check every 30 seconds

    // Update current date and time
    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const date = now.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
            const time = now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            });
            setCurrentDateTime({ date, time });
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 1000); // Update every second
        return () => clearInterval(interval);
    }, []);

    // Fetch orders from the backend - only fetch prepared orders
    const fetchOrdersData = useCallback(async () => {
        try {
            const response = await getWaiterKitchenOrders({ status: 'prepaired' });
            // Ensure we're setting the orders correctly regardless of response structure
            const ordersData = response && typeof response === 'object' ? 
                (Array.isArray(response) ? response : 
                 response.orders || response.data || []) : [];
            setOrders(ordersData);
        } catch (err) {
            // Only log errors in development mode
            if (process.env.NODE_ENV === 'development') {
                console.error("Error fetching orders:", err);
            }
            setError("Failed to fetch orders. Please try again.");
        }
    }, [getWaiterKitchenOrders]);

    // Fetch orders every 5 seconds
    useEffect(() => {
        fetchOrdersData();
        const interval = setInterval(fetchOrdersData, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [fetchOrdersData]);

    // Mark order as served (for admin to simulate)
    const serveOrder = async (orderId) => {
        // Validate orderId
        if (!orderId) {
            toast.error("Invalid order ID. Cannot mark order as served.");
            return;
        }
        
        // Show confirmation dialog
        if (!window.confirm(`Are you sure you want to mark order #${orderId.substring(0, 8)} as served?`)) {
            return; // User cancelled
        }
        
        try {
            // For kitchen orders, we need to update each individual kitchen order item
            // First, get the kitchen orders for this order ID
            const kitchenOrdersForOrder = orders.filter(order => 
                (order.order_id?._id || order.order_id || order._id) === orderId
            );
            
            // Update each kitchen order item to 'served' status
            const updatePromises = kitchenOrdersForOrder.map(kitchenOrder => 
                updateWaiterKitchenOrderStatus(kitchenOrder._id, 'served')
            );
            
            await Promise.all(updatePromises);
            
            // Also update the parent order status to 'served'
            await updateOrderStatus(orderId, 'served');
            
            toast.success(`Order #${orderId.substring(0, 8)} marked as served!`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            
            // Refresh orders
            fetchOrdersData();
        } catch (err) {
            // Only log errors in development mode
            if (process.env.NODE_ENV === 'development') {
                console.error("Error marking order as served:", err);
            }
            toast.error("Failed to mark order as served. Please try again.");
            
            // Refresh orders even if there was an error to ensure UI consistency
            fetchOrdersData();
        }
    };

    // Group orders by orderId
    const groupedOrders = orders.reduce((acc, order) => {
        // Handle kitchen order structure
        const orderId = order.order_id?._id || order.order_id || order._id;
        if (!orderId) return acc; // Skip invalid orders
        
        if (!acc[orderId]) {
            acc[orderId] = {
                table_number: order.table_number || (order.order_id?.table_number),
                // Get status from parent order if available, otherwise from kitchen order
                status: (order.order_id && order.order_id.status) || order.status,
                items: [],
            };
        }
        acc[orderId].items.push({
            item_name: order.item_name || 'Unknown Item',
            quantity: order.quantity || 1,
            customization: order.customizations || order.customization || '', // 🆕 Include customization data
        });
        return acc;
    }, {});

    // Parse customization string into readable format
    const parseCustomization = (customizationString) => {
        if (!customizationString || customizationString.trim() === '') {
            return null;
        }
        
        const parts = customizationString.split(' | ');
        const parsed = {
            spice: '',
            extras: [],
            restrictions: [],
            notes: ''
        };
        
        parts.forEach(part => {
            if (part.startsWith('Spice:')) {
                parsed.spice = part.replace('Spice:', '').trim();
            } else if (part.startsWith('Extras:')) {
                parsed.extras = part.replace('Extras:', '').trim().split(', ').filter(e => e);
            } else if (part.startsWith('Restrictions:')) {
                parsed.restrictions = part.replace('Restrictions:', '').trim().split(', ').filter(r => r);
            } else if (part.startsWith('Notes:')) {
                parsed.notes = part.replace('Notes:', '').trim();
            }
        });
        
        return parsed;
    };

    return (
        <>
        <AdminNavbar />
        <div className="waiter-screen">
            <div className="waiter-header">
                <h1 className="waiter-title">🍽️ Admin - Waiter Live Screen</h1>
                <div className="date-time-display">
                    <div className="datetime-card">
                        <span className="current-date">📅 {currentDateTime.date}</span>
                        <span className="current-time">🕐 {currentDateTime.time}</span>
                    </div>
                </div>
            </div>
            
            {error && (
                <div className="error-message">
                    <p>Error: {error}</p>
                </div>
            )}
            
            <div className="orders-container">
                {Object.entries(groupedOrders)
                    .map(([orderId, order]) => (
                        <div key={orderId} className={`order-card ${order.status}`}>
                            {/* Order Header */}
                            <div className="order-header">
                                <div className="order-info">
                                    <h2 className="order-id">Order #{orderId.substring(0, 8)}</h2>
                                    <div className="table-info">
                                        <span className="table-number">🪑 Table {order.table_number || 'N/A'}</span>
                                        <span className={`status-badge ${order.status}`}>
                                            {order.status === 'pending' && '⏳'}
                                            {order.status === 'preparing' && '👨‍🍳'}
                                            {order.status === 'prepaired' && '✅'}
                                            {order.status === 'served' && '🍽️'}
                                            {order.status ? order.status.toUpperCase() : 'UNKNOWN'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Order Items */}
                            <div className="order-items">
                                {order.items.map((item, index) => {
                                    const customization = parseCustomization(item.customization);
                                    return (
                                        <div key={index} className="order-item">
                                            <div className="item-details">
                                                <span className="item-name">{item.item_name}</span>
                                                <span className="item-quantity">x{item.quantity}</span>
                                            </div>
                                            
                                            {/* Customizations Display */}
                                            {customization && (
                                                <div className="customizations">
                                                    {customization.spice && (
                                                        <div className="customization-item spice">
                                                            <span className="icon">🌶️</span>
                                                            <span className="label">Spice:</span>
                                                            <span className="value">{customization.spice}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {customization.extras.length > 0 && (
                                                        <div className="customization-item extras">
                                                            <span className="icon">➕</span>
                                                            <span className="label">Extras:</span>
                                                            <span className="value">{customization.extras.join(', ')}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {customization.restrictions.length > 0 && (
                                                        <div className="customization-item restrictions">
                                                            <span className="icon">🚫</span>
                                                            <span className="label">Restrictions:</span>
                                                            <span className="value">{customization.restrictions.join(', ')}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {customization.notes && (
                                                        <div className="customization-item notes">
                                                            <span className="icon">📝</span>
                                                            <span className="label">Notes:</span>
                                                            <span className="value">{customization.notes}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Action Button */}
                            <div className="order-actions">
                                <button 
                                    className="serve-btn"
                                    onClick={() => serveOrder(orderId)}
                                >
                                    ✅ Mark as Served
                                </button>
                            </div>
                        </div>
                    ))}
                
                {Object.keys(groupedOrders).length === 0 && (
                    <div className="no-orders">
                        <div className="no-orders-content">
                            <span className="no-orders-icon">🍽️</span>
                            <h3>No Orders Ready</h3>
                            <p>Prepared orders will appear here when ready.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
        <ToastContainer />
        </>
    );
};

export default AdminWaiterScreen;