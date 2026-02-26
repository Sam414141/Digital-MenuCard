import React, { useState, useEffect } from "react";
import "../styles/KitchenScreen.css"; // Reuse the same CSS
import "../styles/KitchenStaffDashboard.css"; // Additional dashboard styling
import WaiterNavbar from "../components/WaiterNavbar";
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const WaiterDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        todaysOrders: 0,
        pendingOrders: 0,
        servedOrders: 0,
        statusCounts: {
            pending: 0,
            preparing: 0,
            prepaired: 0,
            served: 0,
            completed: 0,
            cancelled: 0
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch waiter stats
    const fetchWaiterStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getWaiterStats();
            // Ensure we're setting the stats correctly based on API response
            setStats({
                todaysOrders: response.todaysOrders || 0,
                pendingOrders: response.pendingOrders || 0,
                servedOrders: response.servedOrders || 0,
                statusCounts: response.statusCounts || {
                    pending: 0,
                    preparing: 0,
                    prepaired: 0,
                    served: 0,
                    completed: 0,
                    cancelled: 0
                }
            });
        } catch (error) {
            console.error("Error fetching waiter stats:", error);
            setError(error.message || "Failed to fetch waiter statistics");
            // Check if it's an authentication error
            if (error.response?.status === 401) {
                // Don't automatically redirect here, let the AuthProvider handle it
                console.log("Authentication error - session may have expired");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWaiterStats();
        // Refresh stats every 30 seconds
        const interval = setInterval(fetchWaiterStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <WaiterNavbar />
            <div className="kitchen-screen">
                <div className="kitchen-header">
                    <h1 className="kitchen-title">Waiter Dashboard</h1>
                    <div className="welcome-message">
                        <p>Welcome, {user?.firstName}! Monitor waiter operations and performance metrics.</p>
                    </div>
                </div>
                
                {error && (
                    <div className="error-message">
                        <p>Error: {error}</p>
                    </div>
                )}
                
                <div className="dashboard-content">
                    <div className="dashboard-card">
                        <h2>Waiter Operations Overview</h2>
                        <p>Monitor waiter staff performance and order serving metrics.</p>
                        <div className="dashboard-actions">
                            <button 
                                className="action-btn primary-action"
                                onClick={() => {
                                    if (user?.role === 'admin') {
                                        navigate('/admin/waiter-screen');
                                    } else {
                                        navigate('/staff/waiter');
                                    }
                                }}
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'View Live Waiter Screen'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="dashboard-info">
                        <h3>Performance Metrics</h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <span className="stat-value">{stats.pendingOrders}</span>
                                <span className="stat-label">Pending Orders</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">{stats.statusCounts?.prepaired || 0}</span>
                                <span className="stat-label">Ready to Serve</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">{stats.servedOrders}</span>
                                <span className="stat-label">Served Today</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-value">{stats.todaysOrders}</span>
                                <span className="stat-label">Today's Orders</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WaiterDashboard;