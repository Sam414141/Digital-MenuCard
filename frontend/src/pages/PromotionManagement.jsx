import React, { useState, useEffect } from 'react';
import { 
    Tag, 
    Plus, 
    Edit, 
    Trash2, 
    Save, 
    X, 
    Search,
    Calendar,
    IndianRupee,
    Percent,
    Gift,
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    BarChart3
} from 'lucide-react';
import AdminNavbar from '../components/AdminNavbar';
import Footer from '../components/Footer';
import { usePromotions } from '../hooks/usePromotions'; // Import the promotions hook
import apiService from '../services/apiService'; // Use apiService instead of fetch
import './PromotionManagement.css';

const PromotionManagement = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [filters, setFilters] = useState({ search: '', activeOnly: false });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [analytics, setAnalytics] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);

    const {
        loading: promotionsLoading,
        error: promotionsError,
        fetchPromotions,
        createPromotion,
        updatePromotion,
        deletePromotion
    } = usePromotions(); // Use the promotions hook

    const [newPromotion, setNewPromotion] = useState({
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        valid_from: '',
        valid_to: '',
        applicable_items: [],
        minimum_order_value: '',
        usage_limit: '1'
    });

    useEffect(() => {
        fetchPromotionsData();
        fetchAnalytics();
    }, [filters]);

    const fetchPromotionsData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.activeOnly) params.active_only = 'true';

            const response = await fetchPromotions(params);
            setPromotions(response);
        } catch (error) {
            console.error('Error fetching promotions:', error);
            showMessage('error', 'Failed to load promotions');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            // Use apiService instead of direct fetch call
            const data = await apiService.getPromotionAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleAddPromotion = async () => {
        try {
            await createPromotion(newPromotion);
            setNewPromotion({
                name: '', description: '', discount_type: 'percentage',
                discount_value: '', valid_from: '', valid_to: '',
                applicable_items: [], minimum_order_value: '', usage_limit: '1'
            });
            setShowAddForm(false);
            fetchPromotionsData();
            fetchAnalytics();
            showMessage('success', 'Promotion created successfully');
        } catch (error) {
            console.error('Error adding promotion:', error);
            showMessage('error', error.response?.data?.error || 'Failed to create promotion');
        }
    };

    const handleUpdatePromotion = async (id, updates) => {
        try {
            await updatePromotion(id, updates);
            setEditingPromotion(null);
            fetchPromotionsData();
            fetchAnalytics();
            showMessage('success', 'Promotion updated successfully');
        } catch (error) {
            console.error('Error updating promotion:', error);
            showMessage('error', 'Failed to update promotion');
        }
    };

    const handleDeletePromotion = async (id) => {
        if (!window.confirm('Are you sure you want to delete this promotion?')) return;
        
        try {
            await deletePromotion(id);
            fetchPromotionsData();
            fetchAnalytics();
            showMessage('success', 'Promotion deleted successfully');
        } catch (error) {
            console.error('Error deleting promotion:', error);
            showMessage('error', 'Failed to delete promotion');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#059669';
            case 'scheduled': return '#3b82f6';
            case 'expired': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <CheckCircle size={16} />;
            case 'scheduled': return <Clock size={16} />;
            case 'expired': return <X size={16} />;
            default: return <AlertTriangle size={16} />;
        }
    };

    const getDiscountIcon = (type) => {
        switch (type) {
            case 'percentage': return <Percent size={16} />;
            case 'fixed_amount': return <IndianRupee size={16} />;
            case 'buy_get': return <Gift size={16} />;
            default: return <Tag size={16} />;
        }
    };

    const formatDiscountValue = (type, value) => {
        switch (type) {
            case 'percentage': return `${value}% OFF`;
            case 'fixed_amount': return `₹${value} OFF`;
            case 'buy_get': return `Buy ${value} Get 1 FREE`;
            default: return value;
        }
    };

    const EditForm = ({ promotion, onSave, onCancel }) => {
        const [formData, setFormData] = useState({
            name: promotion.name,
            description: promotion.description || '',
            discount_type: promotion.discount_type,
            discount_value: promotion.discount_value,
            valid_from: new Date(promotion.valid_from).toISOString().split('T')[0],
            valid_to: new Date(promotion.valid_to).toISOString().split('T')[0],
            minimum_order_value: promotion.minimum_order_value || '',
            usage_limit: promotion.usage_limit || '1'
        });

        const handleSubmit = (e) => {
            e.preventDefault();
            onSave(promotion.id, formData);
        };

        return (
            <form onSubmit={handleSubmit} className="edit-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Promotion Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Discount Type</label>
                        <select
                            value={formData.discount_type}
                            onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                            required
                        >
                            <option value="percentage">Percentage</option>
                            <option value="fixed_amount">Fixed Amount</option>
                            <option value="buy_get">Buy X Get Y</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Discount Value</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.discount_value}
                            onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Usage Limit</label>
                        <input
                            type="number"
                            value={formData.usage_limit}
                            onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Valid From</label>
                        <input
                            type="date"
                            value={formData.valid_from}
                            onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Valid To</label>
                        <input
                            type="date"
                            value={formData.valid_to}
                            onChange={(e) => setFormData({...formData, valid_to: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Minimum Order Value (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.minimum_order_value}
                            onChange={(e) => setFormData({...formData, minimum_order_value: e.target.value})}
                        />
                    </div>
                    <div className="form-group full-width">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows="3"
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="save-btn">
                        <Save size={16} />
                        Save Changes
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
                <div className="promotion-management">
                    <div className="loading">Loading promotion management...</div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <AdminNavbar />
            <div className="promotion-management">
                <div className="page-header">
                    <h1>
                        <Tag />
                        Promotion Management
                    </h1>
                    <p>Create and manage discounts, coupons, and special offers</p>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Analytics Dashboard */}
                {analytics && (
                    <div className="analytics-dashboard">
                        <div className="analytics-header">
                            <h2>Promotion Analytics</h2>
                            <button 
                                className="analytics-toggle"
                                onClick={() => setShowAnalytics(!showAnalytics)}
                            >
                                <BarChart3 size={16} />
                                {showAnalytics ? 'Hide' : 'Show'} Details
                            </button>
                        </div>
                        
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Promotions</h3>
                                <div className="stat-value">{analytics.summary.total_promotions}</div>
                            </div>
                            <div className="stat-card active">
                                <h3>Active Promotions</h3>
                                <div className="stat-value">{analytics.summary.active_promotions}</div>
                            </div>
                            <div className="stat-card scheduled">
                                <h3>Scheduled</h3>
                                <div className="stat-value">{analytics.summary.scheduled_promotions}</div>
                            </div>
                            <div className="stat-card expired">
                                <h3>Expired</h3>
                                <div className="stat-value">{analytics.summary.expired_promotions}</div>
                            </div>
                        </div>

                        {showAnalytics && (
                            <div className="analytics-details">
                                <h3>Promotion Types</h3>
                                <div className="promotion-types">
                                    {analytics.promotion_types.map(type => (
                                        <div key={type.type} className="type-card">
                                            <div className="type-info">
                                                {getDiscountIcon(type.type)}
                                                <h4>{type.type.replace('_', ' ').toUpperCase()}</h4>
                                            </div>
                                            <div className="type-stats">
                                                <span>Count: {type.count}</span>
                                                <span>Avg: {type.average_discount?.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Controls */}
                <div className="controls-section">
                    <div className="search-filters">
                        <div className="search-box">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search promotions..."
                                value={filters.search}
                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                            />
                        </div>
                        <label className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={filters.activeOnly}
                                onChange={(e) => setFilters({...filters, activeOnly: e.target.checked})}
                            />
                            <span>Active only</span>
                        </label>
                    </div>

                    <div className="action-buttons">
                        <button className="primary-btn" onClick={() => setShowAddForm(true)}>
                            <Plus size={16} />
                            Add Promotion
                        </button>
                    </div>
                </div>

                {/* Add Promotion Form */}
                {showAddForm && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h3>Create New Promotion</h3>
                                <button onClick={() => setShowAddForm(false)} className="close-btn">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-content">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Promotion Name</label>
                                        <input
                                            type="text"
                                            value={newPromotion.name}
                                            onChange={(e) => setNewPromotion({...newPromotion, name: e.target.value})}
                                            placeholder="e.g., Summer Special"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Discount Type</label>
                                        <select
                                            value={newPromotion.discount_type}
                                            onChange={(e) => setNewPromotion({...newPromotion, discount_type: e.target.value})}
                                            required
                                        >
                                            <option value="percentage">Percentage Discount</option>
                                            <option value="fixed_amount">Fixed Amount Off</option>
                                            <option value="buy_get">Buy X Get Y Free</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            {newPromotion.discount_type === 'percentage' ? 'Percentage (%)' :
                                             newPromotion.discount_type === 'fixed_amount' ? 'Amount (₹)' :
                                             'Quantity to Buy'}
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={newPromotion.discount_value}
                                            onChange={(e) => setNewPromotion({...newPromotion, discount_value: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Usage Limit</label>
                                        <input
                                            type="number"
                                            value={newPromotion.usage_limit}
                                            onChange={(e) => setNewPromotion({...newPromotion, usage_limit: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Valid From</label>
                                        <input
                                            type="date"
                                            value={newPromotion.valid_from}
                                            onChange={(e) => setNewPromotion({...newPromotion, valid_from: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Valid To</label>
                                        <input
                                            type="date"
                                            value={newPromotion.valid_to}
                                            onChange={(e) => setNewPromotion({...newPromotion, valid_to: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Minimum Order Value (₹)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={newPromotion.minimum_order_value}
                                            onChange={(e) => setNewPromotion({...newPromotion, minimum_order_value: e.target.value})}
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Description</label>
                                        <textarea
                                            value={newPromotion.description}
                                            onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})}
                                            placeholder="Describe the promotion details..."
                                            rows="3"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button onClick={handleAddPromotion} className="primary-btn">
                                    <Plus size={16} />
                                    Create Promotion
                                </button>
                                <button onClick={() => setShowAddForm(false)} className="secondary-btn">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Promotions Grid */}
                <div className="promotions-grid">
                    {promotions.map(promotion => (
                        <div key={promotion.id} className="promotion-card">
                            <div className="card-header">
                                <div className="promotion-title">
                                    <h3>{promotion.name}</h3>
                                    <div 
                                        className="status-badge"
                                        style={{ 
                                            backgroundColor: getStatusColor(promotion.status),
                                            color: 'white'
                                        }}
                                    >
                                        {getStatusIcon(promotion.status)}
                                        {promotion.status.toUpperCase()}
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button 
                                        className="edit-btn"
                                        onClick={() => setEditingPromotion(promotion)}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => handleDeletePromotion(promotion.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {editingPromotion?.id === promotion.id ? (
                                <EditForm
                                    promotion={promotion}
                                    onSave={handleUpdatePromotion}
                                    onCancel={() => setEditingPromotion(null)}
                                />
                            ) : (
                                <div className="card-content">
                                    <div className="discount-display">
                                        <div className="discount-icon">
                                            {getDiscountIcon(promotion.discount_type)}
                                        </div>
                                        <div className="discount-value">
                                            {formatDiscountValue(promotion.discount_type, promotion.discount_value)}
                                        </div>
                                    </div>
                                    
                                    {promotion.description && (
                                        <div className="promotion-description">
                                            <p>{promotion.description}</p>
                                        </div>
                                    )}
                                    
                                    <div className="promotion-details">
                                        <div className="detail-row">
                                            <span>Valid Period:</span>
                                            <span>
                                                {new Date(promotion.valid_from).toLocaleDateString()} - {' '}
                                                {new Date(promotion.valid_to).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {promotion.minimum_order_value && (
                                            <div className="detail-row">
                                                <span>Min Order:</span>
                                                <span>₹{promotion.minimum_order_value}</span>
                                            </div>
                                        )}
                                        <div className="detail-row">
                                            <span>Usage Limit:</span>
                                            <span>{promotion.usage_limit}</span>
                                        </div>
                                        {promotion.created_by_name && (
                                            <div className="detail-row">
                                                <span>Created by:</span>
                                                <span>{promotion.created_by_name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {promotions.length === 0 && (
                    <div className="no-data">
                        <Tag size={48} />
                        <h3>No promotions found</h3>
                        <p>Create your first promotion to attract customers with special offers.</p>
                        <button className="primary-btn" onClick={() => setShowAddForm(true)}>
                            <Plus size={16} />
                            Create First Promotion
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default PromotionManagement;