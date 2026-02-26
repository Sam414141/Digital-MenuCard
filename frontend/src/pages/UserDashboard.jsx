import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useErrorHandler from '../hooks/useErrorHandler';
import useFavorites from '../hooks/useFavorites';
import apiService from '../services/apiService';
import {
    User, 
    Settings, 
    ShoppingBag, 
    Heart,
    TrendingUp,
    Calendar,
    IndianRupee,
    Package,
    Star,
    Clock,
    Eye,
    RotateCcw,
    Edit,
    Phone,
    Mail,
    MapPin,
    Shield,
    RefreshCw,
    AlertCircle,
    Loader
} from 'lucide-react';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { error, isLoading, handleApiCall, clearError } = useErrorHandler();
    const {
        favorites,
        loading: favoritesLoading,
        error: favoritesError,
        fetchFavorites,
        removeFromFavorites,
        toggleFavorite
    } = useFavorites();
    
    const [dashboardData, setDashboardData] = useState({
        stats: {},
        recentOrders: [],
        spendingTrend: []
    });
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshing, setRefreshing] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchDashboardData();
        fetchFavorites();
    }, [isAuthenticated, navigate]);

    /**
     * Fetch comprehensive dashboard data
     */
    const fetchDashboardData = async () => {
        try {
            clearError();
            
            const response = await handleApiCall(async () => {
                return await apiService.getUserStats();
            });
            
            if (response.status === 'success') {
                setDashboardData(response.data);
            } else {
                throw new Error(response.message || 'Failed to fetch dashboard data');
            }
        } catch (err) {
            // Error handling is managed by useErrorHandler hook
            console.error('Dashboard data fetch failed:', err);
        }
    };

    /**
     * Refresh dashboard data
     */
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            fetchDashboardData(),
            fetchFavorites()
        ]);
        setRefreshing(false);
    };

    /**
     * Handle removing item from favorites
     */
    const handleRemoveFavorite = async (favoriteId) => {
        const result = await removeFromFavorites(favoriteId);
        if (!result.success) {
            console.error('Failed to remove favorite:', result.error);
        }
    };

    /**
     * Handle reordering from favorite item
     */
    const handleReorderFavorite = async (item) => {
        try {
            // Navigate to menu with the item selected or add to cart directly
            // This would depend on your cart implementation
            navigate('/menu', { 
                state: { 
                    selectedItem: item,
                    addToCart: true 
                }
            });
        } catch (err) {
            console.error('Failed to reorder favorite:', err);
        }
    };

    /**
     * Format currency for display
     */
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    /**
     * Format date for display
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    /**
     * Get status color for orders
     */
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'green';
            case 'pending': return 'orange';
            case 'in progress': return 'blue';
            case 'cancelled': return 'red';
            default: return 'gray';
        }
    };

    /**
     * Render loading state
     */
    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="dashboard-loading">
                    <div className="loading-spinner">
                        <RefreshCw className="spin" size={32} />
                    </div>
                    <p>Loading your dashboard...</p>
                </div>
                <Footer />
            </>
        );
    }

    /**
     * Render error state
     */
    if (error) {
        return (
            <>
                <Navbar />
                <div className="dashboard-error">
                    <AlertCircle size={48} className="error-icon" />
                    <h2>Oops! Something went wrong</h2>
                    <p>{error.message}</p>
                    <div className="error-actions">
                        <button onClick={fetchDashboardData} className="retry-button">
                            <RefreshCw size={16} />
                            Try Again
                        </button>
                        <button onClick={() => navigate('/menu')} className="menu-button">
                            <Package size={16} />
                            Go to Menu
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const { stats, recentOrders, spendingTrend } = dashboardData;

    return (
        <>
            <Navbar />
            <div className="user-dashboard">
                {/* Dashboard Header */}
                <div className="dashboard-header">
                    <div className="user-welcome">
                        <div className="user-avatar">
                            <User size={48} />
                        </div>
                        <div className="welcome-text">
                            <h1>Welcome back, {user?.firstName}!</h1>
                            <p>Here's what's happening with your account</p>
                        </div>
                    </div>
                    <div className="quick-actions">
                        <button 
                            className="action-btn refresh"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw size={20} className={refreshing ? 'spin' : ''} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                        <button 
                            className="action-btn primary"
                            onClick={() => navigate('/menu')}
                        >
                            <Package size={20} />
                            Order Now
                        </button>
                        <button 
                            className="action-btn secondary"
                            onClick={() => navigate('/profile')}
                        >
                            <Settings size={20} />
                            Settings
                        </button>
                    </div>
                </div>

                {/* Dashboard Tabs */}
                <div className="dashboard-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <TrendingUp size={20} />
                        Overview
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <ShoppingBag size={20} />
                        Recent Orders
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
                        onClick={() => setActiveTab('favorites')}
                    >
                        <Heart size={20} />
                        Favorites
                    </button>
                </div>

                {/* Dashboard Content */}
                <div className="dashboard-content">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="overview-tab">
                            {/* Stats Cards */}
                            <div className="stats-grid">
                                <div className="stat-card\">
                                    <div className="stat-icon orders">
                                        <ShoppingBag size={24} />
                                    </div>
                                    <div className="stat-content\">
                                        <h3>{stats.totalOrders || 0}</h3>
                                        <p>Total Orders</p>
                                        <span className="stat-detail\">
                                            {stats.completedOrders || 0} completed
                                        </span>
                                    </div>
                                </div>

                                <div className="stat-card\">
                                    <div className="stat-icon spending\">
                                        <IndianRupee size={24} />
                                    </div>
                                    <div className="stat-content\">
                                        <h3>{formatCurrency(stats.totalSpent || 0)}</h3>
                                        <p>Total Spent</p>
                                        <span className="stat-detail\">
                                            Avg: {formatCurrency(stats.avgOrderValue || 0)}
                                        </span>
                                    </div>
                                </div>

                                <div className="stat-card\">
                                    <div className="stat-icon favorites\">
                                        <Heart size={24} />
                                    </div>
                                    <div className="stat-content\">
                                        <h3>{favorites.length || 0}</h3>
                                        <p>Favorite Items</p>
                                        <span className="stat-detail\">
                                            Saved for quick order
                                        </span>
                                    </div>
                                </div>

                                <div className="stat-card\">
                                    <div className="stat-icon activity\">
                                        <Calendar size={24} />
                                    </div>
                                    <div className="stat-content\">
                                        <h3>{stats.daysOrdered || 0}</h3>
                                        <p>Days Active</p>
                                        <span className="stat-detail\">
                                            Since joining
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Spending Trend Chart */}
                            {spendingTrend.length > 0 && (
                                <div className="chart-section">
                                    <h3>Spending Trend (Last 6 Months)</h3>
                                    <div className="simple-chart">
                                        {spendingTrend.map((month, index) => (
                                            <div key={index} className="chart-bar">
                                                <div 
                                                    className="bar" 
                                                    style={{
                                                        height: `${(month.totalSpent / Math.max(...spendingTrend.map(m => m.totalSpent))) * 100}%`
                                                    }}
                                                ></div>
                                                <span className="bar-label">
                                                    {new Date(month.month).toLocaleDateString('en-US', { month: 'short' })}
                                                </span>
                                                <span className="bar-value">
                                                    {formatCurrency(month.totalSpent)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Recent Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="orders-tab">
                            <div className="section-header">
                                <h3>Recent Orders</h3>
                                <button 
                                    className="view-all-btn"
                                    onClick={() => navigate('/orders')}
                                >
                                    <Eye size={16} />
                                    View All
                                </button>
                            </div>
                            
                            {recentOrders.length === 0 ? (
                                <div className="empty-state">
                                    <ShoppingBag size={48} />
                                    <h4>No orders yet</h4>
                                    <p>Start by browsing our menu and placing your first order!</p>
                                    <button 
                                        className="cta-button"
                                        onClick={() => navigate('/menu')}
                                    >
                                        Browse Menu
                                    </button>
                                </div>
                            ) : (
                                <div className="orders-list">
                                    {recentOrders.map(order => (
                                        <div key={order.id} className="order-item">
                                            <div className="order-info">
                                                <h4>Order #{order.id}</h4>
                                                <p>{order.itemCount} items • {formatDate(order.createdAt)}</p>
                                            </div>
                                            <div className="order-details">
                                                <span className={`status ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                                <span className="price">
                                                    {formatCurrency(order.totalPrice)}
                                                </span>
                                            </div>
                                            <div className="order-actions">
                                                <button 
                                                    className="action-btn-small"
                                                    onClick={() => navigate(`/orders/${order.id}`)}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Favorites Tab */}
                    {activeTab === 'favorites' && (
                        <div className="favorites-tab">
                            <div className="section-header">
                                <h3>Your Favorite Items</h3>
                                <button 
                                    className="add-favorites-btn"
                                    onClick={() => navigate('/menu')}
                                >
                                    <Heart size={16} />
                                    Add More
                                </button>
                            </div>
                            
                            {favoritesLoading ? (
                                <div className="loading-state">
                                    <Loader className="spin" size={32} />
                                    <p>Loading your favorites...</p>
                                </div>
                            ) : favoritesError ? (
                                <div className="error-state">
                                    <AlertCircle size={32} />
                                    <p>Failed to load favorites: {favoritesError}</p>
                                    <button onClick={fetchFavorites} className="retry-btn">
                                        Try Again
                                    </button>
                                </div>
                            ) : favorites.length === 0 ? (
                                <div className="empty-state">
                                    <Heart size={48} />
                                    <h4>No favorites yet</h4>
                                    <p>Browse our menu and save your favorite items for quick ordering!</p>
                                    <button 
                                        className="cta-button"
                                        onClick={() => navigate('/menu')}
                                    >
                                        Explore Menu
                                    </button>
                                </div>
                            ) : (
                                <div className="favorites-grid">
                                    {favorites.map(favorite => (
                                        <div key={favorite.favoriteId} className="favorite-item">
                                            <div className="item-image">
                                                <img 
                                                    src={favorite.item.image || '/images/placeholder.jpg'} 
                                                    alt={favorite.item.name}
                                                    onError={(e) => {
                                                        e.target.src = '/images/placeholder.jpg';
                                                    }}
                                                />
                                                <button 
                                                    className="remove-favorite-btn"
                                                    onClick={() => handleRemoveFavorite(favorite.favoriteId)}
                                                    title="Remove from favorites"
                                                >
                                                    <Heart size={16} fill="currentColor" />
                                                </button>
                                            </div>
                                            <div className="item-info">
                                                <h4>{favorite.item.name}</h4>
                                                <p className="item-description">{favorite.item.description}</p>
                                                <p className="item-category">{favorite.item.category}</p>
                                                <p className="item-price">{formatCurrency(favorite.item.price)}</p>
                                                {favorite.customizations && (
                                                    <div className="customizations">
                                                        <span className="customized-badge">Customized</span>
                                                        <p className="customization-details">{favorite.customizations}</p>
                                                    </div>
                                                )}
                                                <span className="favorited-date">
                                                    Favorited {formatDate(favorite.favoritedAt)}
                                                </span>
                                            </div>
                                            <div className="item-actions">
                                                <button 
                                                    className="order-again-btn"
                                                    onClick={() => handleReorderFavorite(favorite.item)}
                                                >
                                                    <ShoppingBag size={16} />
                                                    Order Again
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default UserDashboard;