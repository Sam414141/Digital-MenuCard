import React, { useEffect, useState, useRef } from "react";
import "../styles/KitchenScreen.css"; // Import the CSS file
import AdminNavbar from "../components/AdminNavbar";
import { useOrders } from '../hooks/useOrders'; // Import the orders hook
import useApiUrl from '../hooks/useApiUrl';
import useIPMonitor from '../hooks/useIPMonitor'; // Add IP monitoring
import { useIpContext } from '../context/IpContext'; // Import IP context
import { useAuth } from '../context/AuthContext'; // Import auth context

const AdminKitchenScreen = () => {
    const [orders, setOrders] = useState([]);
    const [currentDateTime, setCurrentDateTime] = useState({
        date: "",
        time: "",
    });
    const [loading, setLoading] = useState(false);
    const [processingItems, setProcessingItems] = useState({}); // Track processing state for individual items
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null); // State for selected order popup
    const [showOrderPopup, setShowOrderPopup] = useState(false); // State for showing popup
    const [preparingItem, setPreparingItem] = useState(null); // Track which item is being prepared

    const { buildUrl } = useApiUrl();
    const { getKitchenScreenOrders, updateKitchenOrderStatus, removeOrderFromKitchen } = useOrders(); // Use the orders hook
    const { ip } = useIpContext(); // Get IP from context
    
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

    // Fetch orders from API - only fetch pending and preparing orders
    const fetchKitchenOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            // Use the new kitchen-specific endpoint with status filter
            const response = await getKitchenScreenOrders({ status: ['pending', 'prepairing'] });
            setOrders(response);
            console.log("Fetched Kitchen Orders:", response); // Debugging
        } catch (error) {
            console.error("Error fetching kitchen orders:", error);
            setError("Failed to fetch orders. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    // Update order status
    const handleUpdateOrderStatus = async (kitchenOrderId, status) => {
        try {
            setLoading(true);
            const response = await updateKitchenOrderStatus(kitchenOrderId, status);
            console.log(`Kitchen order ${kitchenOrderId} status updated to ${status}`);
            
            // Update local state directly instead of refetching all orders
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order._id === kitchenOrderId 
                        ? { ...order, status } 
                        : order
                )
            );
            
            // Also update the selectedOrder if it's the same item (for popup)
            if (selectedOrder) {
                setSelectedOrder(prevSelected => {
                    // Update items in the selected order
                    const updatedItems = prevSelected.items.map(item => 
                        item.id === kitchenOrderId 
                            ? { ...item, status } 
                            : item
                    );
                    
                    // Update overall order status based on item statuses
                    const itemStatuses = updatedItems.map(item => item.status);
                    let overallStatus = 'pending';
                    if (itemStatuses.includes('prepairing')) {
                        overallStatus = 'prepairing';
                    } else if (itemStatuses.every(s => s === 'prepaired')) {
                        overallStatus = 'prepaired';
                    } else if (itemStatuses.every(s => s === 'completed')) {
                        overallStatus = 'completed';
                    }
                    
                    return { 
                        ...prevSelected, 
                        items: updatedItems,
                        status: overallStatus
                    };
                });
            }
        } catch (error) {
            console.error(`Error updating kitchen order ${kitchenOrderId} status:`, error);
            setError("Failed to update order status. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    // Wrapper function for starting cooking with validation
    const handleStartCooking = async (kitchenOrderId) => {
        // Check if there's already an order in preparing
        const inProgressItems = orders.filter(order => order.status === 'prepairing');
        
        if (inProgressItems.length > 0) {
            const confirm = window.confirm(
                `There is already an order (ID: ${inProgressItems[0]._id}) currently being cooked. ` +
                `Are you sure you want to start cooking another order?\n\n` +
                `Note: Physically, you can only cook one item at a time.`
            );
            
            if (!confirm) {
                return; // User cancelled
            }
        }
        
        // Find the order item being prepared
        const orderItem = orders.find(order => order._id === kitchenOrderId);
        
        if (!orderItem) {
            console.error("Order item not found in local state:", kitchenOrderId);
            alert("Error: Order item details not found. Please refresh the page.");
            return;
        }

        if (orderItem) {
            const preparingItemData = {
                orderId: orderItem.order_id?._id || orderItem.order_id,
                itemId: orderItem._id,
                itemName: orderItem.item_name || orderItem.menu_item_id?.name || 'Unknown Item'
            };
            setPreparingItem(preparingItemData);
        }
        
        // Set processing state for this item
        setProcessingItems(prev => ({ ...prev, [kitchenOrderId]: true }));
        
        try {
            // Proceed with updating status
            await handleUpdateOrderStatus(kitchenOrderId, 'prepairing');
        } finally {
            // Clear processing state for this item
            setProcessingItems(prev => {
                const newState = { ...prev };
                delete newState[kitchenOrderId];
                return newState;
            });
        }
    };
    
    // Wrapper function for marking as prepaired with confirmation
    const handleMarkAsPrepared = async (kitchenOrderId) => {
        const confirm = window.confirm(
            `Are you sure you want to mark this item as prepaired?\n\n` +
            `This will notify the wait staff that the item is ready to be served.`
        );
        
        if (!confirm) {
            return; // User cancelled
        }
        
        // Clear the preparing item when marking as prepared
        setPreparingItem(null);

        
        // Set processing state for this item
        setProcessingItems(prev => ({ ...prev, [kitchenOrderId]: true }));
        
        try {
            // Proceed with updating status
            await handleUpdateOrderStatus(kitchenOrderId, 'prepaired');
        } finally {
            // Clear processing state for this item
            setProcessingItems(prev => {
                const newState = { ...prev };
                delete newState[kitchenOrderId];
                return newState;
            });
        }
    };

    // Remove order
    const removeOrder = async (orderId, status) => {
        try {
            if (status === "completed") {
                const response = await removeOrderFromKitchen(orderId);
                console.log(`Order ${orderId} removed`, response);
                
                // Update local state directly instead of refetching all orders
                setOrders(prevOrders => prevOrders.filter(order => order.order_id !== orderId));
                
                // Also close the popup if it's showing this order
                if (selectedOrder && selectedOrder.orderId === orderId) {
                    closeOrderPopup();
                }
            } else {
                if (window.confirm("The order is not completed. Are you sure you want to remove it?")) {
                    const response = await removeOrderFromKitchen(orderId);
                    console.log(`Order ${orderId} removed`, response);
                    
                    // Update local state directly instead of refetching all orders
                    setOrders(prevOrders => prevOrders.filter(order => order.order_id !== orderId));
                    
                    // Also close the popup if it's showing this order
                    if (selectedOrder && selectedOrder.orderId === orderId) {
                        closeOrderPopup();
                    }
                }
            }
        } catch (error) {
            console.error(`Error removing order ${orderId}:`, error);
            setError("Failed to remove order. Please try again.");
        }
    };

    // Fetch orders every 5 seconds
    useEffect(() => {
        fetchKitchenOrders();
        const interval = setInterval(fetchKitchenOrders, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, []);

    // Group orders by orderId
    const groupedOrders = (orders || []).reduce((acc, order) => {
        // Handle case where order might be undefined or null
        if (!order) return acc;
        
        // Handle both populated and non-populated order_id
        const orderId = order.order_id?._id || order.order_id;
        if (!acc[orderId]) {
            acc[orderId] = {
                table_number: order.table_number,
                status: order.status,
                items: [],
                customer: order.order_id?.user_id ? 
                    `${order.order_id.user_id.first_name} ${order.order_id.user_id.last_name}` : 
                    'Guest',
                createdAt: order.order_id?.createdAt || order.createdAt
            };
        }
        // Add the kitchen order item to the order group
        acc[orderId].items.push({
            id: order._id,
            item_name: order.item_name,
            quantity: order.quantity,
            customization: order.customizations,
            status: order.status
        });
        
        return acc;
    }, {});
    // Update the overall order status based on item statuses
    Object.values(groupedOrders).forEach(order => {
        const itemStatuses = order.items.map(item => item.status);
        if (itemStatuses.includes('prepairing')) {
            order.status = 'prepairing';
        } else if (itemStatuses.every(status => status === 'prepaired')) {
            order.status = 'prepaired';
        } else if (itemStatuses.every(status => status === 'completed')) {
            order.status = 'completed';
        } else {
            order.status = 'pending';
        }
    });

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

    // Get priority level for orders (pending = high, preparing = medium, completed = low)
    const getOrderPriority = (status) => {
        if (status === 'pending') return 1;
        if (status === 'prepairing') return 2;
        return 3;
    };

    // Handle clicking on an order to show popup
    const handleOrderClick = (orderId, order) => {
        setSelectedOrder({ orderId, ...order });
        setShowOrderPopup(true);
    };

    // Close order popup
    const closeOrderPopup = () => {
        setShowOrderPopup(false);
        setSelectedOrder(null);
    };

    return (
        <>
        <AdminNavbar />
        <div className="kitchen-screen">
            <div className="kitchen-header">
                <h1 className="kitchen-title">🍽️ Admin Kitchen Screen</h1>
                <div className="date-time-display">
                    <div className="datetime-card">
                        <span className="current-date">📅 {currentDateTime.date}</span>
                        <span className="current-time">🕐 {currentDateTime.time}</span>
                    </div>
                </div>
            </div>
            
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}
            
            
            
            <div className="orders-container">
                {loading && Object.keys(groupedOrders).length === 0 && (
                    <div className="loading-message">
                        <p>Loading orders...</p>
                    </div>
                )}
                
                {Object.entries(groupedOrders)
                    .sort(([orderIdA, orderA], [orderIdB, orderB]) => {
                        // First sort by status priority (pending > in progress > completed)
                        const priorityDiff = getOrderPriority(orderA.status) - getOrderPriority(orderB.status);
                        if (priorityDiff !== 0) {
                            return priorityDiff;
                        }
                        // Then sort by order ID in descending order (recent orders first)
                        return Number(orderIdB) - Number(orderIdA);
                    })
                    .map(([orderId, order]) => (
                        <div 
                            key={orderId} 
                            className={`order-card compact ${order.status.replace(' ', '-')}`}
                            onClick={() => handleOrderClick(orderId, order)}
                        >
                            <div className="order-summary">
                                <div className="order-id">#{orderId.substring(0, 8)}</div>
                                <div className="order-meta">
                                    <span className="table-number">🪑 {order.table_number}</span>
                                    <span className={`status-badge ${order.status.replace('_', '-')}`}>
                                        {order.status === 'pending' && '⏳'}
                                        {order.status === 'prepairing' && '👨‍🍳'}
                                        {order.status === 'prepaired' && '✅'}
                                        {order.status === 'completed' && '📦'}
                                        {order.status === 'cancelled' && '❌'}
                                        {order.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                
                {!loading && Object.keys(groupedOrders).length === 0 && (
                    <div className="no-orders">
                        <div className="no-orders-content">
                            <span className="no-orders-icon">🍽️</span>
                            <h3>No Active Orders</h3>
                            <p>All caught up! No pending orders in the kitchen.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Order Detail Popup */}
        {showOrderPopup && selectedOrder && (
            <div className="order-popup-overlay" onClick={closeOrderPopup}>
                <div className="order-popup" onClick={(e) => e.stopPropagation()}>
                    <div className="popup-header">
                        <h2>Order #{selectedOrder.orderId.substring(0, 8)}</h2>
                        <button className="close-btn" onClick={closeOrderPopup}>×</button>
                    </div>
                    
                    <div className="popup-content">
                        <div className="order-details">
                            <div className="detail-row">
                                <span className="label">Table:</span>
                                <span className="value">🪑 Table {selectedOrder.table_number}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Customer:</span>
                                <span className="value">👤 {selectedOrder.customer}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Status:</span>
                                <span className={`status-badge ${selectedOrder.status.replace('_', '-')}`}>
                                    {selectedOrder.status === 'pending' && '⏳'}
                                    {selectedOrder.status === 'prepairing' && '👨‍🍳'}
                                    {selectedOrder.status === 'prepaired' && '✅'}
                                    {selectedOrder.status === 'completed' && '📦'}
                                    {selectedOrder.status === 'cancelled' && '❌'}
                                    {selectedOrder.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="order-items-list">
                            <h3>Order Items</h3>
                            {selectedOrder.items.map((item, index) => {
                                const customization = parseCustomization(item.customization);
                                return (
                                    <div key={index} className={`order-item-detail ${item.status.replace(' ', '-')}`}>
                                        <div className="item-header">
                                            <h4 className="item-name">{item.item_name}</h4>
                                            <div className="item-meta">
                                                <span className="item-quantity">x{item.quantity}</span>
                                                <span className={`item-status ${item.status.replace('_', '-')}`}>
                                                    {item.status === 'pending' && '⏳'}
                                                    {item.status === 'prepairing' && '👨‍🍳'}
                                                    {item.status === 'prepaired' && '✅'}
                                                    {item.status === 'completed' && '📦'}
                                                    {item.status === 'cancelled' && '❌'}
                                                    {item.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Customizations Display */}
                                        {customization && (
                                            <div className="customizations">
                                                {customization.spice && (
                                                    <div className="customization-item spice">
                                                        <span className="icon">🌶️</span>
                                                        <span className="label">Spice Level:</span>
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
                                                        <span className="label">Special Notes:</span>
                                                        <span className="value">{customization.notes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Action Buttons for Individual Items */}
                                        <div className="item-actions">
                                            {item.status === 'pending' && (
                                                <button
                                                    onClick={() => handleStartCooking(item.id)}
                                                    className={`action-btn start-cooking ${processingItems[item.id] ? 'processing' : ''}`}
                                                    disabled={loading || processingItems[item.id]}
                                                >
                                                    {processingItems[item.id] ? '⏳ Processing...' : '👨‍🍳 Start Cooking'}
                                                </button>
                                            )}
                                            
                                            {item.status === 'prepairing' && (
                                                <button
                                                    onClick={() => handleMarkAsPrepared(item.id)}
                                                    className={`action-btn mark-ready ${processingItems[item.id] ? 'processing' : ''}`}
                                                    disabled={loading || processingItems[item.id]}
                                                >
                                                    {processingItems[item.id] ? '⏳ Processing...' : '✅ Mark Prepaired'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Overall Order Actions */}
                        <div className="order-actions">
                            {/* Remove Order button removed as per requirements - chefs should not be able to delete orders */}
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default AdminKitchenScreen;