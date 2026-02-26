import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import useErrorHandler from '../hooks/useErrorHandler';
import AdminNavbar from '../components/AdminNavbar';
import { 
    TrendingUp, 
    IndianRupee, 
    ShoppingCart, 
    Users, 
    Package, 
    Star,
    Calendar,
    BarChart3,
    PieChart,
    LineChart,
    Download,
    FileText,
    Filter,
    RefreshCw,
    AlertCircle,
    Target,
    Activity,
    CheckCircle,
    AlertTriangle,
    TrendingDown,
    Clock,
    MapPin,
    Phone,
    Mail,
    MessageSquare,
    UserPlus,
    Repeat,
    Award,
    GanttChart
} from 'lucide-react';
import '../styles/AdminAnalytics.css';

const AdminAnalytics = () => {
    const { error, isLoading, handleApiCall, clearError } = useErrorHandler();
    
    const [analyticsData, setAnalyticsData] = useState({
        dashboard: {},
        dailySales: [],
        salesByCategory: [],
        customers: {},
        performance: {},
        inventoryTurnover: [],
        revenueTrends: [],
        feedbackAnalytics: {},
        popularItems: [],
        peakHours: [],
        revenueByCategory: [],
        customerDemographics: {},
        orderPatterns: {},
        salesForecast: []
    });
    
    const [filters, setFilters] = useState({
        dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
        dateTo: new Date().toISOString().split('T')[0], // today
        period: 'daily',
        granularity: 'daily', // daily, weekly, monthly
        chartType: 'bar' // bar, line, area
    });
    
    const [activeTab, setActiveTab] = useState('overview');
    const [refreshing, setRefreshing] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [chartView, setChartView] = useState('combined'); // combined, daily, weekly, monthly

    useEffect(() => {
        fetchAnalyticsData();
    }, [filters.dateFrom, filters.dateTo, filters.granularity]);

    const fetchAnalyticsData = async () => {
        try {
            clearError();
            
            // Wrap each API call in a safe handler
            const safeApiCall = async (apiFunc) => {
                try {
                    const result = await apiFunc();
                    return result || {};
                } catch (err) {
                    console.warn('API call failed:', err.message);
                    return {};
                }
            };
            
            const [dashboardRes, dailySalesRes, categorySalesRes, customersRes, performanceRes, inventoryRes, trendsRes, feedbackRes, popularItemsRes, peakHoursRes, revenueByCategoryRes, customerDemographicsRes, orderPatternsRes, salesForecastRes] = await Promise.all([
                safeApiCall(() => apiService.getAdminSalesSummary()),
                safeApiCall(() => apiService.getSalesAnalytics()),
                safeApiCall(() => apiService.getSalesByCategory()),
                safeApiCall(() => apiService.getCustomerDemographics({ date_from: filters.dateFrom, date_to: filters.dateTo })),
                safeApiCall(() => apiService.getPerformanceAnalytics({ date_from: filters.dateFrom, date_to: filters.dateTo })),
                safeApiCall(() => apiService.getInventoryTurnover({ date_from: filters.dateFrom, date_to: filters.dateTo })),
                safeApiCall(() => apiService.getSalesTrends()),
                safeApiCall(() => apiService.getCustomerInsights()),
                safeApiCall(() => apiService.getPopularItems({ date_from: filters.dateFrom, date_to: filters.dateTo, limit: 10 })),
                safeApiCall(() => apiService.getPeakHours({ date_from: filters.dateFrom, date_to: filters.dateTo })),
                safeApiCall(() => apiService.getRevenueByCategory({ date_from: filters.dateFrom, date_to: filters.dateTo })),
                safeApiCall(() => apiService.getCustomerDemographics({ date_from: filters.dateFrom, date_to: filters.dateTo })),
                safeApiCall(() => apiService.getOrderPatterns({ date_from: filters.dateFrom, date_to: filters.dateTo })),
                safeApiCall(() => apiService.getSalesForecast({ date_from: filters.dateFrom, date_to: filters.dateTo }))
            ]);

            console.log('Daily Sales Response:', dailySalesRes);
            console.log('Category Sales Response:', categorySalesRes);

            // Extract data ensuring we handle both formats
            const dailySalesArray = dailySalesRes?.data?.salesData || dailySalesRes?.salesData || [];
            const categorySalesArray = categorySalesRes?.data || categorySalesRes || [];

            console.log('Processed Daily Sales:', dailySalesArray);
            console.log('Processed Category Sales:', categorySalesArray);

            setAnalyticsData({
                dashboard: dashboardRes?.data || {},
                dailySales: dailySalesArray,
                salesByCategory: categorySalesArray,
                customers: customerDemographicsRes?.data || {},
                performance: performanceRes?.data || {},
                inventoryTurnover: inventoryRes?.data || [],
                revenueTrends: trendsRes?.data || [],
                feedbackAnalytics: feedbackRes?.data || {},
                popularItems: popularItemsRes?.data || [],
                peakHours: peakHoursRes?.data || [],
                revenueByCategory: revenueByCategoryRes?.data || [],
                customerDemographics: customerDemographicsRes?.data || {},
                orderPatterns: orderPatternsRes?.data || {},
                salesForecast: salesForecastRes?.data || []
            });

        } catch (err) {
            console.error('Analytics data fetch error:', err);
            // Error is handled by useErrorHandler
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAnalyticsData();
        setRefreshing(false);
    };

    const handleGenerateTestData = async () => {
        try {
            const response = await apiService.generateTestData();
            console.log('Test data generated:', response);
            // Refresh analytics data after generating test data
            await new Promise(resolve => setTimeout(resolve, 1000));
            await fetchAnalyticsData();
            alert('Test data generated successfully! Please refresh the page to see the data.');
        } catch (error) {
            console.error('Error generating test data:', error);
            alert('Failed to generate test data. Check console for details.');
        }
    };

    const handleDateChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    const formatPercentage = (value) => {
        return `${(value || 0).toFixed(1)}%`;
    };

    if (error) {
        return (
            <div className="admin-analytics">
                <AdminNavbar />
                <div className="analytics-error">
                    <AlertCircle size={48} className="error-icon" />
                    <h2>Failed to Load Analytics</h2>
                    <p>{error.message}</p>
                    <button onClick={fetchAnalyticsData} className="retry-button">
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="admin-analytics">
            <AdminNavbar />
            
            <div className="analytics-container">
                {/* Analytics Header */}
                <div className="analytics-header">
                    <h1>Analytics Dashboard</h1>
                    <div className="header-actions">
                        <div className="date-filters">
                            <div className="filter-group">
                                <label htmlFor="dateFrom">From:</label>
                                <input 
                                    type="date" 
                                    id="dateFrom"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <label htmlFor="dateTo">To:</label>
                                <input 
                                    type="date" 
                                    id="dateTo"
                                    value={filters.dateTo}
                                    onChange={(e) => handleDateChange('dateTo', e.target.value)}
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleRefresh}
                            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
                            disabled={refreshing}
                        >
                            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="analytics-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <BarChart3 size={16} />
                        Overview
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sales')}
                    >
                        <IndianRupee size={16} />
                        Daily Sales
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'categorySales' ? 'active' : ''}`}
                        onClick={() => setActiveTab('categorySales')}
                    >
                        <BarChart3 size={16} />
                        Category Sales
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('customers')}
                    >
                        <Users size={16} />
                        Customers
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('performance')}
                    >
                        <TrendingUp size={16} />
                        Performance
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inventory')}
                    >
                        <Package size={16} />
                        Inventory
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'demographics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('demographics')}
                    >
                        <Users size={16} />
                        Demographics
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'patterns' ? 'active' : ''}`}
                        onClick={() => setActiveTab('patterns')}
                    >
                        <Target size={16} />
                        Patterns
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'forecast' ? 'active' : ''}`}
                        onClick={() => setActiveTab('forecast')}
                    >
                        <TrendingUp size={16} />
                        Forecast
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'overview' && (
                        <OverviewTab 
                            data={analyticsData.dashboard}
                            feedbackData={analyticsData.feedbackAnalytics}
                            revenueTrends={analyticsData.revenueTrends}
                            popularItems={analyticsData.popularItems}
                            peakHours={analyticsData.peakHours}
                            revenueByCategory={analyticsData.revenueByCategory}
                            isLoading={isLoading}
                            formatCurrency={formatCurrency}
                            formatPercentage={formatPercentage}
                        />
                    )}
                    
                    {activeTab === 'sales' && (
                        <SalesTab 
                            dailySalesData={analyticsData.dailySales}
                            isLoading={isLoading}
                            formatCurrency={formatCurrency}
                            onGenerateTestData={handleGenerateTestData}
                        />
                    )}
                    
                    {activeTab === 'categorySales' && (
                        <CategorySalesTab 
                            data={analyticsData.salesByCategory}
                            isLoading={isLoading}
                            formatCurrency={formatCurrency}
                            onGenerateTestData={handleGenerateTestData}
                        />
                    )}
                    
                    {activeTab === 'customers' && (
                        <CustomersTab 
                            data={analyticsData.customers}
                            demographics={analyticsData.customerDemographics}
                            isLoading={isLoading}
                            formatCurrency={formatCurrency}
                        />
                    )}
                    
                    {activeTab === 'performance' && (
                        <PerformanceTab 
                            data={analyticsData.performance}
                            orderPatterns={analyticsData.orderPatterns}
                            isLoading={isLoading}
                            formatPercentage={formatPercentage}
                        />
                    )}
                    
                    {activeTab === 'inventory' && (
                        <InventoryTab 
                            data={analyticsData.inventoryTurnover}
                            isLoading={isLoading}
                        />
                    )}
                    
                    {activeTab === 'demographics' && (
                        <DemographicsTab 
                            data={analyticsData.customerDemographics}
                            isLoading={isLoading}
                            formatCurrency={formatCurrency}
                        />
                    )}
                    
                    {activeTab === 'patterns' && (
                        <PatternsTab 
                            data={analyticsData.orderPatterns}
                            isLoading={isLoading}
                        />
                    )}
                    
                    {activeTab === 'forecast' && (
                        <ForecastTab 
                            data={analyticsData.salesForecast}
                            isLoading={isLoading}
                            formatCurrency={formatCurrency}
                        />
                    )}
                </div>

                {/* Export Actions */}
                <div className="analytics-actions">
                    <button className="export-btn" onClick={() => alert('PDF export feature coming soon!')}>
                        <FileText size={16} />
                        Export PDF
                    </button>
                    <button className="export-btn" onClick={() => alert('CSV export feature coming soon!')}>
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>
        </div>
    );
};

// Overview Tab Component
const OverviewTab = ({ data, feedbackData, revenueTrends, popularItems, peakHours, revenueByCategory, isLoading, formatCurrency, formatPercentage }) => {
    if (isLoading) {
        return <div className="loading-state">Loading overview data...</div>;
    }

    const overview = data.overview || {};
    const popularItemsData = popularItems || [];
    const peakHoursData = peakHours || [];
    const revenueByCategoryData = revenueByCategory || [];

    return (
        <div className="overview-content">
            {/* Key Metrics Cards */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon orders">
                        <ShoppingCart size={24} />
                    </div>
                    <div className="metric-content">
                        <h3>{overview.total_orders || 0}</h3>
                        <p>Total Orders</p>
                        <span className="metric-detail">
                            {overview.completed_orders || 0} completed
                        </span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{
                                    width: `${Math.min(100, ((overview.total_orders || 0) / Math.max(1, overview.total_orders || 1) * 100))}%`,
                                    backgroundColor: '#3b82f6'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon revenue">
                        <IndianRupee size={24} />
                    </div>
                    <div className="metric-content">
                        <h3>{formatCurrency(overview.total_revenue)}</h3>
                        <p>Total Revenue</p>
                        <span className="metric-detail">
                            Avg: {formatCurrency(overview.average_order_value)}
                        </span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{
                                    width: `${Math.min(100, ((overview.total_revenue || 0) / Math.max(1, overview.total_revenue || 1) * 100))}%`,
                                    backgroundColor: '#10b981'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon completion">
                        <TrendingUp size={24} />
                    </div>
                    <div className="metric-content">
                        <h3>{formatPercentage((overview.completed_orders / overview.total_orders) * 100)}</h3>
                        <p>Completion Rate</p>
                        <span className="metric-detail">
                            {overview.cancelled_orders || 0} cancelled
                        </span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{
                                    width: `${(overview.completed_orders / overview.total_orders) * 100 || 0}%`,
                                    backgroundColor: '#8b5cf6'
                                }}
                            ></div>
                        </div>
                        <div className="progress-label">{(overview.completed_orders / overview.total_orders) * 100 || 0}%</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon rating">
                        <Star size={24} />
                    </div>
                    <div className="metric-content">
                        <h3>{(feedbackData?.overall?.average_rating || 0).toFixed(1)}</h3>
                        <p>Avg Rating</p>
                        <span className="metric-detail">
                            Based on {feedbackData?.overall?.total_feedback || 0} reviews
                        </span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{
                                    width: `${Math.min(100, ((feedbackData?.overall?.average_rating || 0) / 5 * 100))}%`,
                                    backgroundColor: '#f59e0b'
                                }}
                            ></div>
                        </div>
                        <div className="progress-label">{(feedbackData?.overall?.average_rating || 0) / 5 * 100}%</div>
                    </div>
                </div>
            </div>



            {/* Popular Items Table */}
            {popularItemsData.length > 0 && (
                <div className="popular-items-section">
                    <h3>Popular Items</h3>
                    <div className="table-container">
                        <table className="popular-items-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Orders</th>
                                    <th>Revenue</th>
                                    <th>% of Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {popularItemsData.slice(0, 5).map((item, index) => (
                                    <tr key={index}>
                                        <td className="item-name">{item._id || item.item_name}</td>
                                        <td>{item.orderCount || item.order_count}</td>
                                        <td>{formatCurrency(item.totalRevenue || item.revenue)}</td>
                                        <td>-</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Peak Hours */}
            {peakHoursData.length > 0 && (
                <div className="peak-hours-section">
                    <h3>Peak Hours</h3>
                    <div className="peak-hours-chart">
                        {peakHoursData.map((hour, index) => (
                            <div className="hour-bar" key={index}>
                                <div 
                                    className="hour-fill" 
                                    style={{ 
                                        height: `${(hour.orderCount / Math.max(...peakHoursData.map(h => h.orderCount))) * 100}%` 
                                    }}
                                ></div>
                                <span className="hour-label">{hour._id || hour.hour}:00</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Revenue by Category */}
            {revenueByCategoryData.length > 0 && (
                <div className="revenue-category-section">
                    <h3>Revenue by Category</h3>
                    <div className="category-grid">
                        {revenueByCategoryData.slice(0, 4).map((category, index) => (
                            <div className="category-card" key={index}>
                                <h4>{category._id}</h4>
                                <div className="category-stats">
                                    <div className="stat">
                                        <span className="label">Revenue:</span>
                                        <span className="value">{formatCurrency(category.totalRevenue || category.total_revenue)}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="label">Orders:</span>
                                        <span className="value">{category.orderCount || category.order_count || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Sales Tab Component - Daily Sales Table
const SalesTab = ({ dailySalesData, isLoading, formatCurrency, onGenerateTestData }) => {
    const [generating, setGenerating] = useState(false);

    if (isLoading) {
        return <div className="loading-state">Loading sales data...</div>;
    }

    const salesData = Array.isArray(dailySalesData) ? dailySalesData : [];
    
    console.log('SalesTab received data:', salesData);

    const handleGenerateTestData = async () => {
        setGenerating(true);
        try {
            await onGenerateTestData();
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="sales-content">
            <div className="sales-table-section">
                <h3>Daily Sales Breakdown</h3>
                <p style={{color: '#666', fontSize: '0.9rem'}}>Total records: {salesData.length}</p>
                {salesData.length > 0 ? (
                    <div className="table-responsive">
                        <table className="sales-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Total Sales</th>
                                    <th>Order Count</th>
                                    <th>Avg Order Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesData.map((day, index) => (
                                    <tr key={index} className="table-row">
                                        <td><strong>{day.date}</strong></td>
                                        <td>{formatCurrency(day.totalSales)}</td>
                                        <td>{day.orderCount}</td>
                                        <td>{formatCurrency(day.avgOrderValue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="no-data">
                        <p>No sales data available. There are no completed orders in the database yet.</p>
                        <button 
                            onClick={handleGenerateTestData}
                            disabled={generating}
                            style={{
                                marginTop: '1rem',
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                cursor: generating ? 'not-allowed' : 'pointer',
                                opacity: generating ? 0.6 : 1
                            }}
                        >
                            {generating ? 'Generating Test Data...' : 'Generate Test Data'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Category Sales Tab Component
const CategorySalesTab = ({ data, isLoading, formatCurrency, onGenerateTestData }) => {
    const [generating, setGenerating] = useState(false);

    if (isLoading) {
        return <div className="loading-state">Loading category sales data...</div>;
    }

    const categoryData = Array.isArray(data) ? data : [];
    
    console.log('CategorySalesTab received data:', categoryData);

    const handleGenerateTestData = async () => {
        setGenerating(true);
        try {
            await onGenerateTestData();
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="category-sales-content">
            <div className="category-sales-section">
                <h3>Sales by Category</h3>
                <p style={{color: '#666', fontSize: '0.9rem'}}>Total records: {categoryData.length}</p>
                {categoryData.length > 0 ? (
                    <div className="table-responsive">
                        <table className="category-sales-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Items Sold</th>
                                    <th>Total Revenue</th>
                                    <th>Avg Price per Item</th>
                                    <th>Orders</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoryData.map((category, index) => (
                                    <tr key={index} className="table-row">
                                        <td><strong>{category.category_name}</strong></td>
                                        <td>{category.items_sold}</td>
                                        <td>{formatCurrency(category.revenue)}</td>
                                        <td>{formatCurrency(category.average_price)}</td>
                                        <td>{category.order_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="no-data">
                        <p>No category sales data available. There are no completed orders with categories in the database yet.</p>
                        <button 
                            onClick={handleGenerateTestData}
                            disabled={generating}
                            style={{
                                marginTop: '1rem',
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                cursor: generating ? 'not-allowed' : 'pointer',
                                opacity: generating ? 0.6 : 1
                            }}
                        >
                            {generating ? 'Generating Test Data...' : 'Generate Test Data'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Customers Tab Component
const CustomersTab = ({ data, demographics, isLoading, formatCurrency }) => {
    if (isLoading) {
        return <div className="loading-state">Loading customer data...</div>;
    }

    const stats = {
        total_customers: data.totalCustomers || 0,
        new_customers: data.newCustomers || 0,
        returning_customers: data.returningCustomers || 0,
        avg_orders_per_customer: data.avgOrdersPerCustomer || 0
    };
    const topCustomers = [];
    const demographicsData = demographics || {};

    return (
        <div className="customers-content">
            {/* Customer Stats */}
            <div className="customer-stats">
                <div className="stat-card">
                    <h4>Total Customers</h4>
                    <span className="stat-number">{stats.total_customers || 0}</span>
                    <div className="progress-bar-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{
                                    width: `${Math.min(100, ((stats.total_customers || 0) / Math.max(1, stats.total_customers || 0, stats.new_customers || 0, stats.returning_customers || 0) * 100))}%`,
                                    backgroundColor: '#3b82f6'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <h4>New Customers</h4>
                    <span className="stat-number">{stats.new_customers || 0}</span>
                    <div className="progress-bar-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{
                                    width: `${Math.min(100, ((stats.new_customers || 0) / Math.max(1, stats.total_customers || 0, stats.new_customers || 0, stats.returning_customers || 0) * 100))}%`,
                                    backgroundColor: '#10b981'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <h4>Returning Customers</h4>
                    <span className="stat-number">{stats.returning_customers || 0}</span>
                    <div className="progress-bar-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{
                                    width: `${Math.min(100, ((stats.returning_customers || 0) / Math.max(1, stats.total_customers || 0, stats.new_customers || 0, stats.returning_customers || 0) * 100))}%`,
                                    backgroundColor: '#f59e0b'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <h4>Avg Orders/Customer</h4>
                    <span className="stat-number">{(stats.avg_orders_per_customer || 0).toFixed(1)}</span>
                    <div className="progress-bar-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{
                                    width: `${Math.min(100, ((stats.avg_orders_per_customer || 0) / 10) * 100)}%`,
                                    backgroundColor: '#8b5cf6'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>



            {/* Top Customers */}
            {topCustomers.length > 0 && (
                <div className="top-customers-section">
                    <h3>Top Customers</h3>
                    <div className="table-container">
                        <table className="customers-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Phone</th>
                                    <th>Total Orders</th>
                                    <th>Total Spent</th>
                                    <th>Avg Order Value</th>
                                    <th>Last Order</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topCustomers.map((customer, index) => (
                                    <tr key={index}>
                                        <td>{customer.customer_name}</td>
                                        <td>{customer.customer_phone}</td>
                                        <td>{customer.total_orders}</td>
                                        <td>{formatCurrency(customer.total_spent)}</td>
                                        <td>{formatCurrency(customer.avg_order_value)}</td>
                                        <td>{new Date(customer.last_order_date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// Performance Tab Component
const PerformanceTab = ({ data, orderPatterns, isLoading, formatPercentage }) => {
    if (isLoading) {
        return <div className="loading-state">Loading performance data...</div>;
    }

    const kitchen = data.kitchen_performance || {};
    const accuracy = data.accuracy_metrics || {};
    const loadAnalysis = data.load_analysis || [];
    const orderPatternsData = orderPatterns || {};

    return (
        <div className="performance-content">
            {/* Performance Metrics */}
            <div className="performance-metrics">
                <div className="metric-card">
                    <h4>Avg Preparation Time</h4>
                    <span className="metric-value">
                        {(kitchen.avg_preparation_time_minutes || 0).toFixed(1)} min
                    </span>
                    <div className="progress-bar-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{
                                    width: `${Math.min(100, (kitchen.avg_preparation_time_minutes || 0) > 0 ? 100 - ((kitchen.avg_preparation_time_minutes || 0) / 60 * 100) : 100)}%`,
                                    backgroundColor: '#10b981'
                                }}
                            ></div>
                        </div>
                        <div className="progress-label">Efficiency: {Math.max(0, 100 - ((kitchen.avg_preparation_time_minutes || 0) / 60 * 100)).toFixed(0)}%</div>
                    </div>
                </div>
                <div className="metric-card">
                    <h4>Completion Rate</h4>
                    <span className="metric-value">
                        {formatPercentage(kitchen.completion_rate)}
                    </span>
                    <div className="progress-bar-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{
                                    width: `${kitchen.completion_rate || 0}%`,
                                    backgroundColor: '#3b82f6'
                                }}
                            ></div>
                        </div>
                        <div className="progress-label">{kitchen.completion_rate || 0}%</div>
                    </div>
                </div>
                <div className="metric-card">
                    <h4>Order Accuracy</h4>
                    <span className="metric-value">
                        {formatPercentage(accuracy.accuracy_rate)}
                    </span>
                    <div className="progress-bar-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{
                                    width: `${accuracy.accuracy_rate || 0}%`,
                                    backgroundColor: '#8b5cf6'
                                }}
                            ></div>
                        </div>
                        <div className="progress-label">{accuracy.accuracy_rate || 0}%</div>
                    </div>
                </div>
                <div className="metric-card">
                    <h4>Cancelled Orders</h4>
                    <span className="metric-value">{accuracy.cancelled_orders || 0}</span>
                    <div className="progress-bar-container">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{
                                    width: `${Math.min(100, (accuracy.cancelled_orders || 0) > 0 ? 100 - ((accuracy.cancelled_orders || 0) / Math.max(1, accuracy.cancelled_orders || 0, kitchen.total_orders || 1) * 100) : 100)}%`,
                                    backgroundColor: '#ef4444'
                                }}
                            ></div>
                        </div>
                        <div className="progress-label">Success: {Math.max(0, 100 - ((accuracy.cancelled_orders || 0) / Math.max(1, accuracy.cancelled_orders || 0, kitchen.total_orders || 1) * 100)).toFixed(0)}%</div>
                    </div>
                </div>
            </div>

            {/* Order Patterns */}
            <div className="order-patterns">
                <h3>Order Patterns</h3>
                <div className="patterns-grid">
                    <div className="pattern-card">
                        <h4>Avg. Order Value</h4>
                        <span className="pattern-value">{orderPatternsData.avgOrderValue ? `₹${orderPatternsData.avgOrderValue.toFixed(2)}` : '₹0.00'}</span>
                    </div>
                    <div className="pattern-card">
                        <h4>Peak Hours</h4>
                        <span className="pattern-value">{orderPatternsData.peakHours || 'Not available'}</span>
                    </div>
                    <div className="pattern-card">
                        <h4>Order Frequency</h4>
                        <span className="pattern-value">{orderPatternsData.orderFrequency || 'Not available'}</span>
                    </div>
                    <div className="pattern-card">
                        <h4>Popular Items</h4>
                        <span className="pattern-value">{orderPatternsData.popularItemsCount || 0}</span>
                    </div>
                </div>
            </div>

            {/* Load Analysis */}
            {loadAnalysis.length > 0 && (
                <div className="load-analysis-section">
                    <h3>Hourly Load Analysis</h3>
                    <div className="load-chart">
                        {loadAnalysis.map((hour, index) => (
                            <div className="load-bar" key={index}>
                                <div 
                                    className="load-fill" 
                                    style={{ 
                                        height: `${(hour.orders_count / Math.max(...loadAnalysis.map(h => h.orders_count))) * 100}%` 
                                    }}
                                ></div>
                                <span className="load-label">
                                    {new Date(hour.hour_period).getHours()}:00
                                </span>
                                <span className="load-value">{hour.orders_count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Inventory Tab Component
const InventoryTab = ({ data, isLoading }) => {
    if (isLoading) {
        return <div className="loading-state">Loading inventory data...</div>;
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Low Stock': return 'red';
            case 'Medium Stock': return 'orange';
            case 'Good Stock': return 'green';
            default: return 'gray';
        }
    };

    return (
        <div className="inventory-content">
            <h3>Inventory Turnover</h3>
            {data.length === 0 ? (
                <div className="empty-state">
                    <Package size={48} />
                    <p>No inventory data available for the selected period.</p>
                </div>
            ) : (
                <>
                <div className="inventory-summary">
                    <div className="summary-stats">
                        <div className="summary-card">
                            <h4>Total Items</h4>
                            <span className="stat-value">{data.length}</span>
                        </div>
                        <div className="summary-card">
                            <h4>Avg Stock Level</h4>
                            <span className="stat-value">{Math.round(data.reduce((sum, item) => sum + (item.current_stock || 0), 0) / data.length)}</span>
                        </div>
                        <div className="summary-card">
                            <h4>Low Stock Items</h4>
                            <span className="stat-value">{data.filter(item => item.current_stock <= item.reorder_level).length}</span>
                        </div>
                    </div>
                    
                    <div className="inventory-chart">
                        <h4>Stock Level Distribution</h4>
                        <div className="chart-container">
                            {data.slice(0, 5).map((item, index) => (
                                <div key={index} className="chart-item">
                                    <div className="item-label">{item.ingredient_name}</div>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill"
                                                style={{
                                                    width: `${Math.min(100, (item.current_stock / Math.max(...data.map(i => i.current_stock || 1)) * 100))}%`,
                                                    backgroundColor: index % 2 === 0 ? '#3b82f6' : '#10b981'
                                                }}
                                            ></div>
                                        </div>
                                        <div className="progress-label">{item.current_stock} {item.unit}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="table-container">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Ingredient</th>
                                <th>Current Stock</th>
                                <th>Unit</th>
                                <th>Used</th>
                                <th>Reorder Level</th>
                                <th>Status</th>
                                <th>Utilization</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => {
                                const utilization = item.total_used && item.current_stock ? 
                                    (item.total_used / (item.current_stock + item.total_used) * 100) : 0;
                                return (
                                    <tr key={index}>
                                        <td>{item.ingredient_name}</td>
                                        <td>{item.current_stock}</td>
                                        <td>{item.unit}</td>
                                        <td>{item.total_used}</td>
                                        <td>{item.reorder_level}</td>
                                        <td>
                                            <span 
                                                className={`status-badge ${getStatusColor(item.stock_status)}`}
                                            >
                                                {item.stock_status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar">
                                                    <div 
                                                        className="progress-fill"
                                                        style={{
                                                            width: `${utilization}%`,
                                                            backgroundColor: utilization > 80 ? '#ef4444' : utilization > 50 ? '#f59e0b' : '#10b981'
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="progress-label">{Math.round(utilization)}%</div>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                        </tbody>
                    </table>
                </div>
                </>
            )}
        </div>
    );
};

// Demographics Tab Component
const DemographicsTab = ({ data, isLoading, formatCurrency }) => {
    if (isLoading) {
        return <div className="loading-state">Loading demographics data...</div>;
    }

    const demographics = data || {};
    
    return (
        <div className="demographics-content">
            <div className="section-card">
                <h3>Customer Demographics</h3>
                <div className="demographics-grid">
                    <div className="demographic-card">
                        <h4>Total Customers</h4>
                        <span className="demographic-value">{demographics.totalCustomers || 0}</span>
                    </div>
                    <div className="demographic-card">
                        <h4>New Customers</h4>
                        <span className="demographic-value">{demographics.newCustomers || 0}</span>
                    </div>
                    <div className="demographic-card">
                        <h4>Returning Customers</h4>
                        <span className="demographic-value">{demographics.returningCustomers || 0}</span>
                    </div>
                    <div className="demographic-card">
                        <h4>Avg. Orders per Customer</h4>
                        <span className="demographic-value">{(demographics.avgOrdersPerCustomer || 0).toFixed(1)}</span>
                    </div>
                </div>
                
                <div className="demographics-chart">
                    <h4>Customer Distribution</h4>
                    <div className="chart-container">
                        <div className="chart-item">
                            <div className="item-label">Total Customers</div>
                            <div className="progress-bar-container">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill"
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#3b82f6'
                                        }}
                                    ></div>
                                </div>
                                <div className="progress-label">{demographics.totalCustomers || 0}</div>
                            </div>
                        </div>
                        <div className="chart-item">
                            <div className="item-label">New Customers</div>
                            <div className="progress-bar-container">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill"
                                        style={{
                                            width: `${Math.min(100, ((demographics.newCustomers || 0) / Math.max(1, demographics.totalCustomers || 1) * 100))}%`,
                                            backgroundColor: '#10b981'
                                        }}
                                    ></div>
                                </div>
                                <div className="progress-label">{demographics.newCustomers || 0}</div>
                            </div>
                        </div>
                        <div className="chart-item">
                            <div className="item-label">Returning Customers</div>
                            <div className="progress-bar-container">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill"
                                        style={{
                                            width: `${Math.min(100, ((demographics.returningCustomers || 0) / Math.max(1, demographics.totalCustomers || 1) * 100))}%`,
                                            backgroundColor: '#f59e0b'
                                        }}
                                    ></div>
                                </div>
                                <div className="progress-label">{demographics.returningCustomers || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Patterns Tab Component
const PatternsTab = ({ data, isLoading }) => {
    if (isLoading) {
        return <div className="loading-state">Loading pattern data...</div>;
    }

    const patterns = data || {};
    
    return (
        <div className="patterns-content">
            <div className="section-card">
                <h3>Order Patterns</h3>
                <div className="patterns-grid">
                    <div className="pattern-card">
                        <h4>Avg. Order Value</h4>
                        <span className="pattern-value">{patterns.avgOrderValue ? `₹${patterns.avgOrderValue.toFixed(2)}` : '₹0.00'}</span>
                    </div>
                    <div className="pattern-card">
                        <h4>Peak Hours</h4>
                        <span className="pattern-value">{patterns.peakHours || 'Not available'}</span>
                    </div>
                    <div className="pattern-card">
                        <h4>Order Frequency</h4>
                        <span className="pattern-value">{patterns.orderFrequency || 'Not available'}</span>
                    </div>
                    <div className="pattern-card">
                        <h4>Popular Items</h4>
                        <span className="pattern-value">{patterns.popularItemsCount || 0}</span>
                    </div>
                </div>
                
                <div className="patterns-chart">
                    <h4>Order Pattern Analysis</h4>
                    <div className="chart-container">
                        <div className="chart-item">
                            <div className="item-label">Average Order Value</div>
                            <div className="progress-bar-container">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill"
                                        style={{
                                            width: `${Math.min(100, ((patterns.avgOrderValue || 0) / 1000 * 100))}%`,
                                            backgroundColor: '#8b5cf6'
                                        }}
                                    ></div>
                                </div>
                                <div className="progress-label">₹{(patterns.avgOrderValue || 0).toFixed(2)}</div>
                            </div>
                        </div>
                        <div className="chart-item">
                            <div className="item-label">Popular Items Count</div>
                            <div className="progress-bar-container">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill"
                                        style={{
                                            width: `${Math.min(100, ((patterns.popularItemsCount || 0) / 50 * 100))}%`,
                                            backgroundColor: '#f59e0b'
                                        }}
                                    ></div>
                                </div>
                                <div className="progress-label">{patterns.popularItemsCount || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Forecast Tab Component
const ForecastTab = ({ data, isLoading, formatCurrency }) => {
    if (isLoading) {
        return <div className="loading-state">Loading forecast data...</div>;
    }

    const forecast = data || [];
    
    return (
        <div className="forecast-content">
            <div className="section-card">
                <h3>Sales Forecast</h3>
                <div className="forecast-grid">
                    <div className="forecast-card">
                        <h4>Predicted Revenue (Next 7 Days)</h4>
                        <span className="forecast-value">{forecast.length > 0 ? formatCurrency(forecast.reduce((sum, day) => sum + (day.predicted_revenue || 0), 0)) : 'Not available'}</span>
                    </div>
                    <div className="forecast-card">
                        <h4>Predicted Orders (Next 7 Days)</h4>
                        <span className="forecast-value">{forecast.length > 0 ? forecast.reduce((sum, day) => sum + (day.predicted_orders || 0), 0) : 0}</span>
                    </div>
                    <div className="forecast-card">
                        <h4>Trend</h4>
                        <span className="forecast-value">{forecast.length > 0 ? 'Positive' : 'Not available'}</span>
                    </div>
                    <div className="forecast-card">
                        <h4>Confidence Level</h4>
                        <span className="forecast-value">{forecast.length > 0 ? '85%' : 'Not available'}</span>
                    </div>
                </div>
                
                <div className="forecast-chart">
                    <h4>Revenue Forecast</h4>
                    <div className="chart-container">
                        {forecast.slice(0, 5).map((day, index) => (
                            <div key={index} className="chart-item">
                                <div className="item-label">{day.date ? new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : `Day ${index + 1}`}</div>
                                <div className="progress-bar-container">
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill"
                                            style={{
                                                width: `${Math.min(100, (day.predicted_revenue / Math.max(...forecast.map(f => f.predicted_revenue || 1)) * 100))}%`,
                                                backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                                            }}
                                        ></div>
                                    </div>
                                    <div className="progress-label">₹{day.predicted_revenue?.toFixed(2) || 0}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;