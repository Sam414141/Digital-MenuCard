import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService"; // Use apiService instead of axios
import "../styles/AdminDashboard.css";
import { Users, ShoppingCart, IndianRupee, MessageSquare, Phone, Clock, TrendingUp, Calendar, BarChart3, Bell, Package, Star, Activity, Target, TrendingDown, AlertTriangle, CheckCircle, UserPlus, Repeat, PieChart, LineChart, Download, FileText, Filter, RefreshCw, Award, MapPin, Mail, Zap, Flame, TrendingUpDown, GanttChart, Eye, FileBarChart } from 'lucide-react';
import AdminNavbar from "../components/AdminNavbar";
import InventoryDashboard from "../components/InventoryDashboard";
import Reports from "../components/Reports";
import ContactItem from "../components/ContactItem";
import { useIpContext } from "../context/IpContext";

const AdminDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesSummary, setSalesSummary] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [contactUsReports, setContactUsReports] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    newCustomers: 0,
    avgOrderValue: 0,
    completionRate: 0,
    activeOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalCustomers: 0,
    ordersToday: 0,
    revenueToday: 0,
    avgPrepTime: 0,
    topCategory: '',
    topItem: ''
  });
  const [salesTrends, setSalesTrends] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);
  // Individual tab filters (removed global filters)
  const [tabFilters, setTabFilters] = useState({
    overview: {
      dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      dateTo: new Date().toISOString().split('T')[0] // today
    },
    sales: {
      dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      dateTo: new Date().toISOString().split('T')[0] // today
    },
    orders: {
      dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      dateTo: new Date().toISOString().split('T')[0] // today
    },
    customers: {
      dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      dateTo: new Date().toISOString().split('T')[0] // today
    },
    reports: {
      dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      dateTo: new Date().toISOString().split('T')[0] // today
    },
    feedback: {
      dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      dateTo: new Date().toISOString().split('T')[0] // today
    },
    contact: {
      dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      dateTo: new Date().toISOString().split('T')[0] // today
    }
  });
  const { ip } = useIpContext();

  useEffect(() => {
    fetchDashboardData();
  }, [tabFilters[activeTab].dateFrom, tabFilters[activeTab].dateTo]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const currentTabFilters = tabFilters[activeTab];
      
      // Define which tabs need date-dependent data
      const tabsNeedingDateData = ['overview', 'sales', 'reports'];
      
      // Fetch common data that all tabs need
      await Promise.all([
        fetchCustomers(),
        fetchRecentOrders(),
        fetchSalesSummary(),
        fetchFeedbacks(),
        fetchContactUsReports()
      ]);
      
      // Only fetch date-dependent data for tabs that need it
      if (tabsNeedingDateData.includes(activeTab)) {
        await Promise.all([
          fetchSalesTrends(currentTabFilters),
          fetchPopularItems(currentTabFilters),
          fetchPeakHours(currentTabFilters),
          fetchRevenueByCategory(currentTabFilters)
        ]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchSalesTrends = async (tabFilter) => {
    try {
      const currentFilter = tabFilter || tabFilters[activeTab];
      const response = await apiService.getSalesAnalytics({
        date_from: currentFilter.dateFrom,
        date_to: currentFilter.dateTo
      });
      setSalesTrends(response.data?.salesData || []);
    } catch (error) {
      console.error('Error fetching sales trends:', error);
    }
  };

  const fetchPopularItems = async (tabFilter) => {
    try {
      const currentFilter = tabFilter || tabFilters[activeTab];
      const response = await apiService.getPopularItems({ 
        date_from: currentFilter.dateFrom,
        date_to: currentFilter.dateTo,
        limit: 10 
      });
      setPopularItems(response.data || []);
    } catch (error) {
      console.error('Error fetching popular items:', error);
    }
  };

  const fetchPeakHours = async (tabFilter) => {
    try {
      const currentFilter = tabFilter || tabFilters[activeTab];
      const response = await apiService.getPeakHours({
        date_from: currentFilter.dateFrom,
        date_to: currentFilter.dateTo
      });
      setPeakHours(response.data || []);
    } catch (error) {
      console.error('Error fetching peak hours:', error);
    }
  };

  const fetchRevenueByCategory = async (tabFilter) => {
    try {
      const currentFilter = tabFilter || tabFilters[activeTab];
      const response = await apiService.getRevenueByCategory({
        date_from: currentFilter.dateFrom,
        date_to: currentFilter.dateTo
      });
      setRevenueByCategory(response.data || []);
    } catch (error) {
      console.error('Error fetching revenue by category:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await apiService.getAdminCustomers();
      setCustomers(response.data || []);
      setDashboardStats(prev => ({
        ...prev,
        totalCustomers: response.data.length
      }));
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await apiService.getAdminOrders();
      setRecentOrders(response.data || []);
      
      // Calculate dashboard stats based on orders
      const completedOrders = response.data.filter(order => order.status.toLowerCase() === 'completed');
      const pendingOrders = response.data.filter(order => order.status.toLowerCase() === 'pending');
      const cancelledOrders = response.data.filter(order => order.status.toLowerCase() === 'cancelled');
      const todayOrders = response.data.filter(order => 
        new Date(order.created_at).toDateString() === new Date().toDateString()
      );
      const totalRevenue = response.data.reduce((sum, order) => sum + (order.total_price || 0), 0);
      const revenueToday = todayOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
      const avgOrderValue = response.data.length > 0 ? totalRevenue / response.data.length : 0;
      const completionRate = response.data.length > 0 ? (completedOrders.length / response.data.length) * 100 : 0;
      
      setDashboardStats(prev => ({
        ...prev,
        totalOrders: response.data.length,
        totalRevenue,
        avgOrderValue,
        completionRate,
        completedOrders: completedOrders.length,
        activeOrders: response.data.filter(order => ['pending', 'preparing', 'ready'].includes(order.status.toLowerCase())).length,
        pendingOrders: pendingOrders.length,
        cancelledOrders: cancelledOrders.length,
        ordersToday: todayOrders.length,
        revenueToday
      }));
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    }
  };

  const fetchSalesSummary = async () => {
    try {
      const response = await apiService.getAdminSalesSummary();
      setSalesSummary(response.data || {});
    } catch (error) {
      console.error("Error fetching sales summary:", error);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await apiService.getAdminFeedbacks();
      setFeedbacks(response.data || []);
      
      // Calculate new customers from feedback
      const uniqueEmails = new Set(response.data.map(feedback => feedback.email));
      setDashboardStats(prev => ({
        ...prev,
        newCustomers: uniqueEmails.size
      }));
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    }
  };

  const fetchContactUsReports = async () => {
    try {
      const response = await apiService.getAdminContactReports();
      setContactUsReports(response.data || []);
    } catch (error) {
      console.error("Error fetching contact us reports:", error);
    }
  };

  // Removed handleDateChange function since we no longer have global filters
  
  const handleTabDateChange = (tab, field, value) => {
    // Only handle dateFrom and dateTo fields, ignore period
    if (field === 'period') return;
    
    setTabFilters(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value
      }
    }));
  };
  
  // Removed getCurrentTabFilters function since we no longer have global filters

  function formatDate(date) {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(date) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUp size={16} className="trend-positive" />;
    if (value < 0) return <TrendingDown size={16} className="trend-negative" />;
    return <TrendingUpDown size={16} className="trend-neutral" />;
  };

  const getTrendText = (value) => {
    if (value > 0) return `+${value}%`;
    if (value < 0) return `${value}%`;
    return '0%';
  };

  return (
    <>
      <AdminNavbar />
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <div className="dashboard-date-time">
            <span>Date: {formatDate(currentTime)}</span>
            <span>Time: {formatTime(currentTime)}</span>
          </div>
        </div>



        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('overview');
              fetchDashboardData();
            }}
          >
            <BarChart3 size={16} />
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('sales');
              fetchDashboardData();
            }}
          >
            <IndianRupee size={16} />
            Sales
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('orders');
              fetchDashboardData();
            }}
          >
            <ShoppingCart size={16} />
            Orders
          </button>
          <button 
            className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('customers');
              fetchDashboardData();
            }}
          >
            <Users size={16} />
            Customers
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('reports');
              fetchDashboardData();
            }}
          >
            <FileBarChart size={16} />
            Reports
          </button>
          <button 
            className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('feedback');
              fetchDashboardData();
            }}
          >
            <MessageSquare size={16} />
            Feedback
          </button>
          <button 
            className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('contact');
              fetchDashboardData();
            }}
          >
            <Mail size={16} />
            Contact
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="dashboard-content">
            {/* Date Filters for Overview Tab */}
            <div className="analytics-header">
              <div className="date-filters">
                <div className="filter-group">
                  <label htmlFor="overviewDateFrom">From:</label>
                  <input 
                    type="date" 
                    id="overviewDateFrom"
                    value={tabFilters.overview.dateFrom}
                    onChange={(e) => handleTabDateChange('overview', 'dateFrom', e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="overviewDateTo">To:</label>
                  <input 
                    type="date" 
                    id="overviewDateTo"
                    value={tabFilters.overview.dateTo}
                    onChange={(e) => handleTabDateChange('overview', 'dateTo', e.target.value)}
                  />
                </div>

              </div>
            </div>
            
            {/* Key Metrics Cards */}
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">
                  <ShoppingCart size={32} />
                </div>
                <div className="stat-info">
                  <h3>{dashboardStats.totalOrders}</h3>
                  <p>Total Orders</p>
                  <span className="stat-trend positive">
                    {getTrendIcon(12)} {getTrendText(12)}
                  </span>
                </div>
              </div>

              <div className="stat-card secondary">
                <div className="stat-icon">
                  <IndianRupee size={32} />
                </div>
                <div className="stat-info">
                  <h3>{formatCurrency(dashboardStats.totalRevenue)}</h3>
                  <p>Total Revenue</p>
                  <span className="stat-trend positive">
                    {getTrendIcon(8)} {getTrendText(8)}
                  </span>
                </div>
              </div>

              <div className="stat-card accent">
                <div className="stat-icon">
                  <CheckCircle size={32} />
                </div>
                <div className="stat-info">
                  <h3>{formatPercentage(dashboardStats.completionRate)}</h3>
                  <p>Completion Rate</p>
                  <span className="stat-trend positive">
                    {getTrendIcon(5)} {getTrendText(5)}
                  </span>
                </div>
              </div>

              <div className="stat-card info">
                <div className="stat-icon">
                  <Users size={32} />
                </div>
                <div className="stat-info">
                  <h3>{dashboardStats.totalCustomers}</h3>
                  <p>Total Customers</p>
                  <span className="stat-trend positive">
                    {getTrendIcon(3)} {getTrendText(3)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="quick-stat">
                <div className="stat-label">Orders Today</div>
                <div className="stat-value">{dashboardStats.ordersToday}</div>
              </div>
              <div className="quick-stat">
                <div className="stat-label">Revenue Today</div>
                <div className="stat-value">{formatCurrency(dashboardStats.revenueToday)}</div>
              </div>
              <div className="quick-stat">
                <div className="stat-label">Active Orders</div>
                <div className="stat-value">{dashboardStats.activeOrders}</div>
              </div>
              <div className="quick-stat">
                <div className="stat-label">Avg. Order Value</div>
                <div className="stat-value">{formatCurrency(dashboardStats.avgOrderValue)}</div>
              </div>
            </div>

            {/* Sales Trends Chart */}
            <div className="section-card">
              <h2>Sales Trends</h2>
              <div className="sales-chart">
                {salesTrends.length > 0 ? (
                  <div className="chart-bars">
                    {salesTrends.slice(0, 7).map((day, index) => (
                      <div className="chart-bar-container" key={index}>
                        <div 
                          className="chart-bar" 
                          style={{ 
                            height: `${Math.max((day.totalSales / Math.max(...salesTrends.map(d => d.totalSales))) * 100, 10)}%` 
                          }}
                        >
                          <span className="chart-value">{formatCurrency(day.totalSales)}</span>
                        </div>
                        <span className="chart-label">
                          {new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="chart-placeholder">No data available</div>
                )}
              </div>
            </div>

            {/* Inventory Dashboard Section */}
            <div className="dashboard-section">
              <InventoryDashboard />
            </div>

            {/* Category Sales */}
            <div className="section-card">
              <h2>Category Sales Overview</h2>
              <div className="category-boxes">
                <div className="category-box">
                  <h3>Starters</h3>
                  <p>Total Units Sold: <span id="starters-units">{salesSummary ? salesSummary.total_starters_sold : 0}</span></p>
                  <p>Total Revenue: ₹<span id="starters-revenue">{salesSummary ? salesSummary.starters_revenue : "0.00"}</span></p>
                </div>
                <div className="category-box">
                  <h3>Main Course</h3>
                  <p>Total Units Sold: <span id="main-course-units">{salesSummary ? salesSummary.total_main_courses_sold : 0}</span></p>
                  <p>Total Revenue: ₹<span id="main-course-revenue">{salesSummary ? salesSummary.main_courses_revenue : "0.00"}</span></p>
                </div>
                <div className="category-box">
                  <h3>Desserts</h3>
                  <p>Total Units Sold: <span id="desserts-units">{salesSummary ? salesSummary.total_desserts_sold : 0}</span></p>
                  <p>Total Revenue: ₹<span id="desserts-revenue">{salesSummary ? salesSummary.desserts_revenue : "0.00"}</span></p>
                </div>
                <div className="category-box">
                  <h3>Drinks</h3>
                  <p>Total Units Sold: <span id="drinks-units">{salesSummary ? salesSummary.total_drinks_sold : 0}</span></p>
                  <p>Total Revenue: ₹<span id="drinks-revenue">{salesSummary ? salesSummary.drinks_revenue : "0.00"}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="dashboard-content">
            {/* Date Filters for Sales Tab */}
            <div className="analytics-header">
              <div className="date-filters">
                <div className="filter-group">
                  <label htmlFor="salesDateFrom">From:</label>
                  <input 
                    type="date" 
                    id="salesDateFrom"
                    value={tabFilters.sales.dateFrom}
                    onChange={(e) => handleTabDateChange('sales', 'dateFrom', e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="salesDateTo">To:</label>
                  <input 
                    type="date" 
                    id="salesDateTo"
                    value={tabFilters.sales.dateTo}
                    onChange={(e) => handleTabDateChange('sales', 'dateTo', e.target.value)}
                  />
                </div>

              </div>
            </div>
            
            <div className="section-card">
              <h2>Sales Analytics</h2>
              <div className="sales-summary">
                <div className="sales-metric">
                  <h3>{formatCurrency(dashboardStats.totalRevenue)}</h3>
                  <p>Total Revenue</p>
                </div>
                <div className="sales-metric">
                  <h3>{dashboardStats.totalOrders}</h3>
                  <p>Total Orders</p>
                </div>
                <div className="sales-metric">
                  <h3>{formatCurrency(dashboardStats.avgOrderValue)}</h3>
                  <p>Average Order Value</p>
                </div>
                <div className="sales-metric">
                  <h3>{formatPercentage(dashboardStats.completionRate)}</h3>
                  <p>Order Completion Rate</p>
                </div>
              </div>
              
              <h3>Revenue by Category</h3>
              <div className="category-boxes">
                {revenueByCategory.map((category, index) => (
                  <div className="category-box" key={index}>
                    <h3>{category._id}</h3>
                    <p>Total Revenue: ₹<span id={`category-revenue-${index}`}>{category.totalRevenue?.toFixed(2) || '0.00'}</span></p>
                    <p>Order Count: <span id={`category-count-${index}`}>{category.orderCount || 0}</span></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="dashboard-content">
            <div className="section-card">
              <h2>Recent Orders</h2>
              <div className="orders-summary">
                <div className="orders-metric">
                  <h3>{dashboardStats.activeOrders}</h3>
                  <p>Active Orders</p>
                </div>
                <div className="orders-metric pending">
                  <h3>{dashboardStats.pendingOrders}</h3>
                  <p>Pending Orders</p>
                </div>
                <div className="orders-metric completed">
                  <h3>{dashboardStats.completedOrders}</h3>
                  <p>Completed Orders</p>
                </div>
                <div className="orders-metric cancelled">
                  <h3>{dashboardStats.cancelledOrders}</h3>
                  <p>Cancelled Orders</p>
                </div>
              </div>
              
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Table Number</th>
                    <th>Status</th>
                    <th>Total Price</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 10).map((order, index) => (
                    <tr key={order.id}>
                      <td>#{order.id?.substring(0, 8) || order._id?.substring(0, 8)}</td>
                      <td>{order.table_number}</td>
                      <td>
                        <span className={`status-badge ${order.status.toLowerCase().replace(' ', '-')}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>₹{order.total_price}</td>
                      <td>{new Date(order.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="dashboard-content">
            <div className="section-card">
              <h2>Customer Overview</h2>
              <div className="customers-summary">
                <div className="customer-metric">
                  <h3>{dashboardStats.totalCustomers}</h3>
                  <p>Total Customers</p>
                </div>
                <div className="customer-metric new">
                  <h3>{dashboardStats.newCustomers}</h3>
                  <p>New Customers</p>
                </div>
                <div className="customer-metric returning">
                  <h3>{dashboardStats.totalCustomers - dashboardStats.newCustomers}</h3>
                  <p>Returning Customers</p>
                </div>
                <div className="customer-metric avg-orders">
                  <h3>{(dashboardStats.avgOrderValue || 0).toFixed(1)}</h3>
                  <p>Avg. Orders per Customer</p>
                </div>
              </div>
              
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.slice(0, 10).map((customer, index) => (
                    <tr key={customer.id || customer._id}>
                      <td>{customer.name}</td>
                      <td>{customer.email || 'N/A'}</td>
                      <td>{customer.phone || 'N/A'}</td>
                      <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="dashboard-content">
            {/* Date Filters for Reports Tab */}
            <div className="analytics-header">
              <div className="date-filters">
                <div className="filter-group">
                  <label htmlFor="reportsDateFrom">From:</label>
                  <input 
                    type="date" 
                    id="reportsDateFrom"
                    value={tabFilters.reports.dateFrom}
                    onChange={(e) => handleTabDateChange('reports', 'dateFrom', e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="reportsDateTo">To:</label>
                  <input 
                    type="date" 
                    id="reportsDateTo"
                    value={tabFilters.reports.dateTo}
                    onChange={(e) => handleTabDateChange('reports', 'dateTo', e.target.value)}
                  />
                </div>

              </div>
            </div>
            
            <div className="section-card">
              <h2>Business Reports</h2>
              <Reports filters={tabFilters.reports} />
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="dashboard-content">
            <div className="section-card">
              <h2>Customer Feedback</h2>
              
              <div className="feedback-summary">
                <div className="feedback-metric">
                  <h3>{feedbacks.length}</h3>
                  <p>Total Feedbacks</p>
                </div>
                <div className="feedback-stat-card">
                  <div className="stat-icon">
                    <Star size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>
                      {feedbacks.length > 0 
                        ? (feedbacks.reduce((sum, f) => sum + (f.rating || f.overallExperienceRating || 0), 0) / feedbacks.length).toFixed(1)
                        : '0.0'}
                    </h3>
                    <p>Average Rating</p>
                  </div>
                </div>
                <div className="feedback-stat-card">
                  <div className="stat-icon">
                    <CheckCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{feedbacks.filter(f => (f.rating || f.overallExperienceRating || 0) >= 4).length}</h3>
                    <p>Positive Reviews</p>
                  </div>
                </div>
                <div className="feedback-stat-card">
                  <div className="stat-icon">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>{feedbacks.filter(f => (f.rating || f.overallExperienceRating || 0) <= 2).length}</h3>
                    <p>Needs Attention</p>
                  </div>
                </div>
              </div>
              
              <h3>Recent Feedback</h3>
              <div className="feedback-list">
                {feedbacks.slice(0, 10).map((feedback, index) => (
                  <div key={feedback.id || index} className="feedback-item">
                    <div className="feedback-header">
                      <div className="feedback-user-info">
                        <span className="feedback-email">
                          {feedback.email && feedback.email !== 'Anonymous' ? feedback.email : 'Anonymous'}
                        </span>
                        {feedback.customer_name && feedback.customer_name !== 'Anonymous' && (
                          <span className="feedback-customer">{feedback.customer_name}</span>
                        )}
                        {feedback.table_number && (
                          <span className="feedback-table">Table #{feedback.table_number}</span>
                        )}
                      </div>
                      <div className="feedback-meta">
                        <span className="feedback-date">{new Date(feedback.created_at || feedback.createdAt).toLocaleDateString()}</span>
                        <div className={`sentiment-badge ${feedback.sentiment_category || 'neutral'}`}>
                          {feedback.sentiment_category === 'positive' ? '😊' : 
                           feedback.sentiment_category === 'negative' ? '😞' : '😐'}
                        </div>
                      </div>
                    </div>
                    <div className="feedback-rating-section">
                      <div className="main-rating">
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              className={`star ${i < (feedback.rating || 0) ? 'filled' : ''}`}
                            />
                          ))}
                          <span className="rating-value">{feedback.rating || 0}/5</span>
                        </div>
                      </div>
                      <div className="detailed-ratings">
                        <div className="rating-item">
                          <span className="rating-label">Food:</span>
                          <div className="mini-stars">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={12} 
                                className={`star ${i < (feedback.food_quality || 0) ? 'filled' : ''}`}
                              />
                            ))}
                            <span>{feedback.food_quality || 0}</span>
                          </div>
                        </div>
                        <div className="rating-item">
                          <span className="rating-label">Service:</span>
                          <div className="mini-stars">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={12} 
                                className={`star ${i < (feedback.service_rating || 0) ? 'filled' : ''}`}
                              />
                            ))}
                            <span>{feedback.service_rating || 0}</span>
                          </div>
                        </div>
                        <div className="rating-item">
                          <span className="rating-label">Ambience:</span>
                          <div className="mini-stars">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={12} 
                                className={`star ${i < (feedback.ambience_rating || 0) ? 'filled' : ''}`}
                              />
                            ))}
                            <span>{feedback.ambience_rating || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="feedback-content">
                      <div className="feedback-message">
                        <strong>Overall Experience:</strong>
                        <p>{feedback.overall_experience || feedback.message || 'No detailed feedback provided'}</p>
                      </div>
                      {feedback.would_recommend && (
                        <div className={`recommendation-status ${feedback.would_recommend}`}>
                          <strong>Would Recommend:</strong> 
                          <span className={feedback.would_recommend === 'yes' ? 'positive' : 'negative'}>
                            {feedback.would_recommend === 'yes' ? '👍 Yes' : '👎 No'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="feedback-actions">
                      <button 
                        className="view-details-btn"
                        onClick={() => {
                          const details = `
Feedback Details:

Email: ${feedback.email || 'Anonymous'}
Customer: ${feedback.customer_name || 'N/A'}
Table: ${feedback.table_number || 'N/A'}
Mobile: ${feedback.mobile_number || 'N/A'}
Date: ${new Date(feedback.created_at || feedback.createdAt).toLocaleString()}

Main Rating: ${feedback.rating || 0}/5
Food Quality: ${feedback.food_quality || 0}/5
Service: ${feedback.service_rating || 0}/5
Ambience: ${feedback.ambience_rating || 0}/5

Overall Experience: ${feedback.overall_experience || 'N/A'}

Would Recommend: ${feedback.would_recommend || 'N/A'}

Message: ${feedback.message || 'No message'}
                          `;
                          alert(details);
                        }}
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="dashboard-content">
            <div className="section-card">
              <h2>Contact Reports</h2>
              
              <div className="contact-summary">
                <div className="contact-metric">
                  <h3>{contactUsReports.length}</h3>
                  <p>Total Contact Reports</p>
                </div>
              </div>
              
              <h3>Recent Contact Reports</h3>
              <div className="contact-list">
                {contactUsReports.slice(0, 10).map((report, index) => (
                  <ContactItem key={report.id || index} contact={report} index={index} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminDashboard;
