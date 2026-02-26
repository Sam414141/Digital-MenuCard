import React, { useState, useEffect } from 'react';
import { 
    Package, 
    AlertTriangle, 
    Plus, 
    Edit, 
    Trash2, 
    Save, 
    X, 
    Search,
    Filter,
    TrendingUp,
    TrendingDown,
    FileText,
    RefreshCw,
    ShoppingCart,
    CheckCircle,
    Eye
} from 'lucide-react';
import { useInventory } from '../hooks/useInventory'; // Import the inventory hook
import AdminNavbar from '../components/AdminNavbar';
import Footer from '../components/Footer';
import './InventoryManagement.css';

const InventoryManagement = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [usageHistory, setUsageHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [filters, setFilters] = useState({ search: '', lowStockOnly: false });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [stats, setStats] = useState({});
    const [showReceiveStock, setShowReceiveStock] = useState(false);

    const {
        loading: inventoryLoading,
        error: inventoryError,
        fetchInventory,
        createInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        getInventoryAlerts,
        getInventoryReport,
        getInventoryUsageHistory,
        bulkUpdateInventory
    } = useInventory(); // Use the inventory hook

    const [newItem, setNewItem] = useState({
        ingredient_name: '',
        quantity: '',
        unit: '',
        reorder_level: '',
        supplier_info: ''
    });

    const [receiveStockData, setReceiveStockData] = useState({
        selectedItems: [],
        supplier_info: ''
    });

    useEffect(() => {
        fetchInventoryData();
        fetchAlerts();
        fetchStats();
    }, [filters]);

    const fetchInventoryData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.lowStockOnly) params.low_stock_only = 'true';

            const response = await fetchInventory(params);
            setInventoryItems(response);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            showMessage('error', 'Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAlerts = async () => {
        try {
            const response = await getInventoryAlerts();
            setAlerts(response);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await getInventoryReport();
            setStats(response.summary);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchUsageHistory = async () => {
        try {
            const response = await getInventoryUsageHistory();
            setUsageHistory(response);
            setShowHistory(true);
        } catch (error) {
            console.error('Error fetching usage history:', error);
            showMessage('error', 'Failed to load usage history');
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleAddItem = async () => {
        try {
            await createInventoryItem(newItem);
            setNewItem({ ingredient_name: '', quantity: '', unit: '', reorder_level: '', supplier_info: '' });
            setShowAddForm(false);
            fetchInventoryData();
            fetchAlerts();
            fetchStats();
            showMessage('success', 'Inventory item added successfully');
        } catch (error) {
            console.error('Error adding item:', error);
            showMessage('error', error.response?.data?.error || 'Failed to add item');
        }
    };

    const handleUpdateItem = async (id, updates) => {
        try {
            await updateInventoryItem(id, updates);
            setEditingItem(null);
            fetchInventoryData();
            fetchAlerts();
            fetchStats();
            showMessage('success', 'Inventory item updated successfully');
        } catch (error) {
            console.error('Error updating item:', error);
            showMessage('error', 'Failed to update item');
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        
        try {
            await deleteInventoryItem(id);
            fetchInventoryData();
            fetchAlerts();
            fetchStats();
            showMessage('success', 'Inventory item deleted successfully');
        } catch (error) {
            console.error('Error deleting item:', error);
            showMessage('error', error.response?.data?.error || 'Failed to delete item');
        }
    };

    const handleReceiveStock = async () => {
        try {
            await bulkUpdateInventory(
                receiveStockData.selectedItems.map(item => ({
                    ingredient_id: item.id,
                    quantity_received: parseFloat(item.quantity_received)
                })),
                receiveStockData.supplier_info
            );

            setReceiveStockData({ selectedItems: [], supplier_info: '' });
            setShowReceiveStock(false);
            fetchInventoryData();
            fetchAlerts();
            fetchStats();
            showMessage('success', 'Stock received successfully');
        } catch (error) {
            console.error('Error receiving stock:', error);
            showMessage('error', 'Failed to receive stock');
        }
    };

    const getStockStatusColor = (status) => {
        switch (status) {
            case 'low': return '#dc2626';
            case 'medium': return '#d97706';
            case 'good': return '#059669';
            default: return '#6b7280';
        }
    };

    const getAlertLevelColor = (level) => {
        switch (level) {
            case 'critical': return '#dc2626';
            case 'urgent': return '#ea580c';
            case 'low': return '#d97706';
            default: return '#6b7280';
        }
    };

    const EditForm = ({ item, onSave, onCancel }) => {
        const [formData, setFormData] = useState({
            quantity: item.quantity,
            reorder_level: item.reorder_level,
            supplier_info: item.supplier_info || ''
        });

        const handleSubmit = (e) => {
            e.preventDefault();
            onSave(item.id, formData);
        };

        return (
            <form onSubmit={handleSubmit} className="edit-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Current Stock</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.quantity}
                            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Reorder Level</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.reorder_level}
                            onChange={(e) => setFormData({...formData, reorder_level: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group full-width">
                        <label>Supplier Info</label>
                        <input
                            type="text"
                            value={formData.supplier_info}
                            onChange={(e) => setFormData({...formData, supplier_info: e.target.value})}
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="save-btn">
                        <Save size={16} />
                        Save
                    </button>
                    <button type="button" onClick={onCancel} className="cancel-btn">
                        <X size={16} />
                        Cancel
                    </button>
                </div>
            </form>
        );
    };

    if (loading) {
        return (
            <>
                <AdminNavbar />
                <div className="inventory-management">
                    <div className="loading">Loading inventory management...</div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <AdminNavbar />
            <div className="inventory-management">
                <div className="page-header">
                    <h1>
                        <Package />
                        Inventory Management
                    </h1>
                    <p>Track ingredients, manage stock levels, and monitor usage</p>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Stats Dashboard */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Ingredients</h3>
                        <div className="stat-value">{stats.total_ingredients || 0}</div>
                    </div>
                    <div className="stat-card warning">
                        <h3>Low Stock Items</h3>
                        <div className="stat-value">{stats.low_stock_count || 0}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Total Stock Units</h3>
                        <div className="stat-value">{Math.round(stats.total_stock_units || 0)}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Active Alerts</h3>
                        <div className="stat-value">{alerts.length}</div>
                    </div>
                </div>

                {/* Alerts Section */}
                {alerts.length > 0 && (
                    <div className="alerts-section">
                        <h2>
                            <AlertTriangle />
                            Stock Alerts
                        </h2>
                        <div className="alerts-grid">
                            {alerts.slice(0, 5).map(alert => (
                                <div key={alert.id} className="alert-card" style={{ borderLeftColor: getAlertLevelColor(alert.alert_level) }}>
                                    <div className="alert-header">
                                        <h4>{alert.ingredient_name}</h4>
                                        <span className="alert-level" style={{ backgroundColor: getAlertLevelColor(alert.alert_level) }}>
                                            {alert.alert_level.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="alert-details">
                                        <p>Current: {alert.quantity} {alert.unit}</p>
                                        <p>Reorder Level: {alert.reorder_level} {alert.unit}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="controls-section">
                    <div className="search-filters">
                        <div className="search-box">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search ingredients..."
                                value={filters.search}
                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                            />
                        </div>
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={filters.lowStockOnly}
                                onChange={(e) => setFilters({...filters, lowStockOnly: e.target.checked})}
                            />
                            <span>Low stock only</span>
                        </label>
                    </div>

                    <div className="action-buttons">
                        <button className="primary-btn" onClick={() => setShowAddForm(true)}>
                            <Plus size={16} />
                            Add Item
                        </button>
                        <button className="secondary-btn" onClick={() => setShowReceiveStock(true)}>
                            <ShoppingCart size={16} />
                            Receive Stock
                        </button>
                        <button className="secondary-btn" onClick={fetchUsageHistory}>
                            <Eye size={16} />
                            Usage History
                        </button>
                        <button className="secondary-btn" onClick={fetchInventoryData}>
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Add Item Form */}
                {showAddForm && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h3>Add New Inventory Item</h3>
                                <button onClick={() => setShowAddForm(false)} className="close-btn">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-content">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Ingredient Name</label>
                                        <input
                                            type="text"
                                            value={newItem.ingredient_name}
                                            onChange={(e) => setNewItem({...newItem, ingredient_name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Quantity</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={newItem.quantity}
                                            onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Unit</label>
                                        <select
                                            value={newItem.unit}
                                            onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                                            required
                                        >
                                            <option value="">Select unit...</option>
                                            <option value="kg">Kilograms</option>
                                            <option value="g">Grams</option>
                                            <option value="liters">Liters</option>
                                            <option value="ml">Milliliters</option>
                                            <option value="pieces">Pieces</option>
                                            <option value="bottles">Bottles</option>
                                            <option value="cans">Cans</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Reorder Level</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={newItem.reorder_level}
                                            onChange={(e) => setNewItem({...newItem, reorder_level: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Supplier Info</label>
                                        <input
                                            type="text"
                                            value={newItem.supplier_info}
                                            onChange={(e) => setNewItem({...newItem, supplier_info: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button onClick={handleAddItem} className="primary-btn">
                                    <Plus size={16} />
                                    Add Item
                                </button>
                                <button onClick={() => setShowAddForm(false)} className="secondary-btn">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Receive Stock Modal */}
                {showReceiveStock && (
                    <div className="modal-overlay">
                        <div className="modal large">
                            <div className="modal-header">
                                <h3>Receive Stock</h3>
                                <button onClick={() => setShowReceiveStock(false)} className="close-btn">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-content">
                                <div className="form-group">
                                    <label>Supplier Information</label>
                                    <input
                                        type="text"
                                        placeholder="Supplier name and delivery details..."
                                        value={receiveStockData.supplier_info}
                                        onChange={(e) => setReceiveStockData({...receiveStockData, supplier_info: e.target.value})}
                                    />
                                </div>
                                <div className="receive-stock-grid">
                                    {inventoryItems.map(item => (
                                        <div key={item.id} className="receive-item">
                                            <div className="item-info">
                                                <h4>{item.ingredient_name}</h4>
                                                <p>Current: {item.quantity} {item.unit}</p>
                                            </div>
                                            <div className="receive-input">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Quantity received"
                                                    onChange={(e) => {
                                                        const quantity = e.target.value;
                                                        setReceiveStockData(prev => ({
                                                            ...prev,
                                                            selectedItems: quantity ? 
                                                                [...prev.selectedItems.filter(i => i.id !== item.id), {...item, quantity_received: quantity}] :
                                                                prev.selectedItems.filter(i => i.id !== item.id)
                                                        }));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    onClick={handleReceiveStock} 
                                    className="primary-btn"
                                    disabled={receiveStockData.selectedItems.length === 0}
                                >
                                    <ShoppingCart size={16} />
                                    Receive Stock ({receiveStockData.selectedItems.length} items)
                                </button>
                                <button onClick={() => setShowReceiveStock(false)} className="secondary-btn">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Usage History Modal */}
                {showHistory && (
                    <div className="modal-overlay">
                        <div className="modal large">
                            <div className="modal-header">
                                <h3>Usage History (Last 30 Days)</h3>
                                <button onClick={() => setShowHistory(false)} className="close-btn">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-content">
                                <div className="usage-history">
                                    {usageHistory.length > 0 ? (
                                        <div className="history-table">
                                            <div className="history-header">
                                                <span>Date</span>
                                                <span>Ingredient</span>
                                                <span>Used</span>
                                                <span>Order</span>
                                            </div>
                                            {usageHistory.map(usage => (
                                                <div key={usage.id} className="history-row">
                                                    <span>{new Date(usage.created_at).toLocaleDateString()}</span>
                                                    <span>{usage.ingredient_name}</span>
                                                    <span>{usage.quantity_used} {usage.unit}</span>
                                                    <span>{usage.item_name || 'N/A'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-data">No usage history found</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Inventory Items Grid */}
                <div className="inventory-grid">
                    {inventoryItems.map(item => (
                        <div key={item.id} className="inventory-card">
                            <div className="card-header">
                                <h3>{item.ingredient_name}</h3>
                                <div className="card-actions">
                                    <button 
                                        className="edit-btn"
                                        onClick={() => setEditingItem(item)}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => handleDeleteItem(item.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {editingItem?.id === item.id ? (
                                <EditForm
                                    item={item}
                                    onSave={handleUpdateItem}
                                    onCancel={() => setEditingItem(null)}
                                />
                            ) : (
                                <div className="card-content">
                                    <div className="stock-info">
                                        <div className="quantity-display">
                                            <span className="quantity">{item.quantity}</span>
                                            <span className="unit">{item.unit}</span>
                                        </div>
                                        <div 
                                            className="stock-status"
                                            style={{ color: getStockStatusColor(item.stock_status) }}
                                        >
                                            {item.stock_status === 'low' && <TrendingDown size={16} />}
                                            {item.stock_status === 'medium' && <TrendingUp size={16} />}
                                            {item.stock_status === 'good' && <CheckCircle size={16} />}
                                            {item.stock_status.toUpperCase()}
                                        </div>
                                    </div>
                                    
                                    <div className="item-details">
                                        <div className="detail-row">
                                            <span>Reorder Level:</span>
                                            <span>{item.reorder_level} {item.unit}</span>
                                        </div>
                                        {item.supplier_info && (
                                            <div className="detail-row">
                                                <span>Supplier:</span>
                                                <span>{item.supplier_info}</span>
                                            </div>
                                        )}
                                        <div className="detail-row">
                                            <span>Last Updated:</span>
                                            <span>{new Date(item.last_updated).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {inventoryItems.length === 0 && (
                    <div className="no-data">
                        <Package size={48} />
                        <h3>No inventory items found</h3>
                        <p>Start by adding your first inventory item.</p>
                        <button className="primary-btn" onClick={() => setShowAddForm(true)}>
                            <Plus size={16} />
                            Add First Item
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default InventoryManagement;