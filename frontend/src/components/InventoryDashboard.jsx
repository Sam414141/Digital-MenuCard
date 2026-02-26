import React, { useState, useEffect } from 'react';
import { 
    Package, 
    AlertTriangle, 
    TrendingUp, 
    TrendingDown,
    BarChart3,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Truck
} from 'lucide-react';
import apiService from '../services/apiService'; // Use apiService instead of axios
import { useNavigate } from 'react-router-dom';
import './InventoryDashboard.css';

const InventoryDashboard = () => {
    const [alerts, setAlerts] = useState([]);
    const [inventoryReport, setInventoryReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setRefreshing(true);
            // Use apiService instead of direct axios calls
            const alertsResponse = await apiService.getInventoryAlerts();
            const reportResponse = await apiService.getInventoryReport();

            setAlerts(alertsResponse);
            setInventoryReport(reportResponse);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
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

    const getAlertIcon = (level) => {
        switch (level) {
            case 'critical': return <AlertTriangle size={16} />;
            case 'urgent': return <TrendingDown size={16} />;
            default: return <TrendingDown size={16} />;
        }
    };

    const criticalAlerts = alerts.filter(alert => alert.alert_level === 'critical');
    const urgentAlerts = alerts.filter(alert => alert.alert_level === 'urgent');
    const lowStockAlerts = alerts.filter(alert => alert.alert_level === 'low');

    if (loading) {
        return (
            <div className="inventory-dashboard loading">
                <div className="loading-content">
                    <RefreshCw className="spinning" size={32} />
                    <p>Loading inventory dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="inventory-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h2>
                        <Package />
                        Inventory Overview
                    </h2>
                    <button 
                        className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
                        onClick={fetchDashboardData}
                        disabled={refreshing}
                    >
                        <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Critical Alerts Banner */}
            {criticalAlerts.length > 0 && (
                <div className="critical-banner">
                    <AlertTriangle size={20} />
                    <span>
                        <strong>{criticalAlerts.length}</strong> critical stock alerts require immediate attention!
                    </span>
                    <button 
                        className="view-details-btn"
                        onClick={() => navigate('/inventory')}
                    >
                        View Details
                        <ArrowUpRight size={16} />
                    </button>
                </div>
            )}

            {/* Quick Stats */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-icon good">
                        <Package />
                    </div>
                    <div className="stat-content">
                        <h3>Total Items</h3>
                        <div className="stat-value">{inventoryReport?.summary?.total_ingredients || 0}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon warning">
                        <AlertTriangle />
                    </div>
                    <div className="stat-content">
                        <h3>Low Stock</h3>
                        <div className="stat-value">{inventoryReport?.summary?.low_stock_count || 0}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon info">
                        <BarChart3 />
                    </div>
                    <div className="stat-content">
                        <h3>Total Stock</h3>
                        <div className="stat-value">{Math.round(inventoryReport?.summary?.total_stock_units || 0)}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon danger">
                        <TrendingDown />
                    </div>
                    <div className="stat-content">
                        <h3>Critical Items</h3>
                        <div className="stat-value">{criticalAlerts.length}</div>
                    </div>
                </div>
            </div>

            {/* Alert Categories */}
            <div className="alerts-overview">
                <h3>Stock Alerts</h3>
                <div className="alert-categories">
                    {criticalAlerts.length > 0 && (
                        <div className="alert-category critical">
                            <div className="category-header">
                                <AlertTriangle size={18} />
                                <h4>Critical ({criticalAlerts.length})</h4>
                            </div>
                            <div className="alert-items">
                                {criticalAlerts.slice(0, 3).map(alert => (
                                    <div key={alert.id} className="alert-item">
                                        <span className="item-name">{alert.ingredient_name}</span>
                                        <span className="item-stock">{alert.quantity} {alert.unit}</span>
                                    </div>
                                ))}
                                {criticalAlerts.length > 3 && (
                                    <div className="more-items">
                                        +{criticalAlerts.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {urgentAlerts.length > 0 && (
                        <div className="alert-category urgent">
                            <div className="category-header">
                                <TrendingDown size={18} />
                                <h4>Urgent ({urgentAlerts.length})</h4>
                            </div>
                            <div className="alert-items">
                                {urgentAlerts.slice(0, 3).map(alert => (
                                    <div key={alert.id} className="alert-item">
                                        <span className="item-name">{alert.ingredient_name}</span>
                                        <span className="item-stock">{alert.quantity} {alert.unit}</span>
                                    </div>
                                ))}
                                {urgentAlerts.length > 3 && (
                                    <div className="more-items">
                                        +{urgentAlerts.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {lowStockAlerts.length > 0 && (
                        <div className="alert-category low">
                            <div className="category-header">
                                <TrendingDown size={18} />
                                <h4>Low Stock ({lowStockAlerts.length})</h4>
                            </div>
                            <div className="alert-items">
                                {lowStockAlerts.slice(0, 3).map(alert => (
                                    <div key={alert.id} className="alert-item">
                                        <span className="item-name">{alert.ingredient_name}</span>
                                        <span className="item-stock">{alert.quantity} {alert.unit}</span>
                                    </div>
                                ))}
                                {lowStockAlerts.length > 3 && (
                                    <div className="more-items">
                                        +{lowStockAlerts.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {alerts.length === 0 && (
                        <div className="no-alerts">
                            <Package size={48} />
                            <h4>All Stock Levels Good</h4>
                            <p>No items require immediate attention</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Usage Items */}
            {inventoryReport?.inventory_turnover && (
                <div className="usage-overview">
                    <h3>Top Usage Items (Recent)</h3>
                    <div className="usage-grid">
                        {inventoryReport.inventory_turnover.slice(0, 6).map(item => (
                            <div key={item.ingredient_name} className="usage-card">
                                <h4>{item.ingredient_name}</h4>
                                <div className="usage-stats">
                                    <div className="usage-stat">
                                        <span className="label">Used:</span>
                                        <span className="value">{item.total_used} {item.unit}</span>
                                    </div>
                                    <div className="usage-stat">
                                        <span className="label">Current:</span>
                                        <span className="value">{item.current_stock} {item.unit}</span>
                                    </div>
                                    {item.days_of_stock_remaining && (
                                        <div className="usage-stat">
                                            <span className="label">Days left:</span>
                                            <span className="value days">
                                                <Clock size={14} />
                                                {Math.round(item.days_of_stock_remaining)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                    <button 
                        className="action-card"
                        onClick={() => navigate('/inventory')}
                    >
                        <Package size={24} />
                        <h4>Manage Inventory</h4>
                        <p>View and edit all inventory items</p>
                        <ArrowUpRight size={16} />
                    </button>

                    <button 
                        className="action-card"
                        onClick={() => navigate('/inventory?low_stock=true')}
                    >
                        <AlertTriangle size={24} />
                        <h4>Low Stock Items</h4>
                        <p>Review items needing reorder</p>
                        <ArrowUpRight size={16} />
                    </button>

                    <button 
                        className="action-card"
                        onClick={() => {/* Open receive stock modal in main inventory */}}
                    >
                        <Truck size={24} />
                        <h4>Receive Stock</h4>
                        <p>Update stock from deliveries</p>
                        <ArrowUpRight size={16} />
                    </button>

                    <button 
                        className="action-card"
                        onClick={() => navigate('/analytics')}
                    >
                        <BarChart3 size={24} />
                        <h4>View Reports</h4>
                        <p>Detailed analytics and trends</p>
                        <ArrowUpRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InventoryDashboard;