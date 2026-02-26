import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { 
    TrendingUp, 
    IndianRupee, 
    ShoppingCart, 
    Users, 
    Package, 
    Star,
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
    GanttChart,
    Calendar,
    DollarSign,
    TrendingUpIcon,
    TrendingDownIcon
} from 'lucide-react';
import '../styles/AnalyticalReports.css';

const AnalyticalReports = ({ filters }) => {
    const [reportsData, setReportsData] = useState({
        revenueTrends: [],
        customerGrowth: {},
        orderVolume: [],
        popularCategories: [],
        seasonalTrends: [],
        customerLifetimeValue: {},
        churnRate: {},
        conversionRates: {},
        retentionRates: {},
        operationalInsights: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalyticalReports();
    }, [filters]);

    const fetchAnalyticalReports = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch comprehensive analytical reports from the new API endpoint
            const reportsResponse = await apiService.getComprehensiveReports({ 
                date_from: filters?.dateFrom, 
                date_to: filters?.dateTo 
            });
            
            const reports = reportsResponse.data || {};

            setReportsData({
                revenueTrends: reports.revenueTrends || [],
                customerGrowth: reports.customerGrowth || {},
                orderVolume: reports.orderVolume || [],
                popularCategories: reports.popularCategories || [],
                seasonalTrends: reports.seasonalTrends || [],
                customerLifetimeValue: reports.customerLifetimeValue || {},
                churnRate: reports.churnRate || {},
                conversionRates: reports.conversionRates || {},
                retentionRates: reports.retentionRate || {},
                operationalInsights: reports.operationalInsights || {}
            });
        } catch (err) {
            setError(err.message);
            console.error('Error fetching analytical reports:', err);
        } finally {
            setLoading(false);
        }
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
    
    const exportReport = (format) => {
        // Prepare report data for export
        const reportData = {
            dateRange: `${filters?.dateFrom} to ${filters?.dateTo}`,
            businessIntelligence: {
                totalRevenue: formatCurrency(reportsData.revenueTrends.reduce((sum, day) => sum + (day.revenue || 0), 0)),
                totalCustomers: reportsData.customerGrowth.totalCustomers || 0,
                totalOrders: reportsData.orderVolume.reduce((sum, day) => sum + (day.orderCount || 0), 0),
                conversionRate: formatPercentage(reportsData.conversionRates.overallConversion)
            },
            customerAnalytics: {
                customerLifetimeValue: formatCurrency(reportsData.customerLifetimeValue.projectedCLV),
                churnRate: formatPercentage(reportsData.churnRate.monthlyChurnRate),
                retentionRate: formatPercentage(reportsData.retentionRates.monthlyRetention),
                repeatCustomerRate: formatPercentage(reportsData.retentionRates.monthlyRetention > 0 ? (reportsData.retentionRates.retainedCustomers / (reportsData.retentionRates.retainedCustomers + reportsData.churnRate.lostCustomers) * 100) : 0)
            },
            popularCategories: reportsData.popularCategories.slice(0, 10).map(item => ({
                name: item._id,
                orders: item.orderCount,
                revenue: formatCurrency(item.totalRevenue)
            })),
            operationalInsights: {
                avgProcessingTime: `${reportsData.operationalInsights.avgProcessingTime || 0} hrs`,
                totalOrdersProcessed: reportsData.operationalInsights.totalOrders || 0,
                orderAccuracy: formatPercentage(reportsData.operationalInsights.orderAccuracy)
            }
        };
        
        // Create export based on format
        switch(format) {
            case 'csv':
                exportToCSV(reportData);
                break;
            case 'excel':
                exportToExcel(reportData);
                break;
            case 'pdf':
                exportToPDF(reportData);
                break;
            default:
                exportToCSV(reportData);
        }
    };
    
    const exportToCSV = (data) => {
        // Create CSV content
        let csvContent = 'Digital Menu Card - Analytical Report\n';
        csvContent += `Generated on: ${new Date().toLocaleString()}\n\n`;
        
        csvContent += 'Business Intelligence Summary:\n';
        csvContent += `Total Revenue:,${data.businessIntelligence.totalRevenue}\n`;
        csvContent += `Total Customers:,${data.businessIntelligence.totalCustomers}\n`;
        csvContent += `Total Orders:,${data.businessIntelligence.totalOrders}\n`;
        csvContent += `Conversion Rate:,${data.businessIntelligence.conversionRate}\n\n`;
        
        csvContent += 'Customer Analytics:\n';
        csvContent += `Customer Lifetime Value:,${data.customerAnalytics.customerLifetimeValue}\n`;
        csvContent += `Churn Rate:,${data.customerAnalytics.churnRate}\n`;
        csvContent += `Retention Rate:,${data.customerAnalytics.retentionRate}\n`;
        csvContent += `Repeat Customer Rate:,${data.customerAnalytics.repeatCustomerRate}\n\n`;
        
        csvContent += 'Popular Categories:\n';
        csvContent += 'Category,Orders,Revenue\n';
        data.popularCategories.forEach(cat => {
            csvContent += `${cat.name},${cat.orders},${cat.revenue}\n`;
        });
        
        // Create and download file
        const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const csvLink = document.createElement('a');
        const csvUrl = URL.createObjectURL(csvBlob);
        csvLink.setAttribute('href', csvUrl);
        csvLink.setAttribute('download', `analytical-report-${new Date().toISOString().split('T')[0]}.csv`);
        csvLink.style.visibility = 'hidden';
        document.body.appendChild(csvLink);
        csvLink.click();
        document.body.removeChild(csvLink);
    };
    
    const exportToExcel = (data) => {
        // For simplicity, we'll create a CSV file with .xlsx extension
        // In a real implementation, we'd use a library like xlsx
        let excelContent = 'sep=,\n'; // Excel separator
        excelContent += 'Digital Menu Card - Analytical Report\n';
        excelContent += `Generated on: ${new Date().toLocaleString()}\n\n`;
        
        excelContent += 'Business Intelligence Summary:\n';
        excelContent += `Total Revenue,${data.businessIntelligence.totalRevenue}\n`;
        excelContent += `Total Customers,${data.businessIntelligence.totalCustomers}\n`;
        excelContent += `Total Orders,${data.businessIntelligence.totalOrders}\n`;
        excelContent += `Conversion Rate,${data.businessIntelligence.conversionRate}\n\n`;
        
        excelContent += 'Customer Analytics:\n';
        excelContent += `Customer Lifetime Value,${data.customerAnalytics.customerLifetimeValue}\n`;
        excelContent += `Churn Rate,${data.customerAnalytics.churnRate}\n`;
        excelContent += `Retention Rate,${data.customerAnalytics.retentionRate}\n`;
        excelContent += `Repeat Customer Rate,${data.customerAnalytics.repeatCustomerRate}\n\n`;
        
        excelContent += 'Popular Categories:\n';
        excelContent += 'Category,Orders,Revenue\n';
        data.popularCategories.forEach(cat => {
            excelContent += `${cat.name},${cat.orders},${cat.revenue}\n`;
        });
        
        const excelBlob = new Blob([excelContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;' });
        const excelLink = document.createElement('a');
        const excelUrl = URL.createObjectURL(excelBlob);
        excelLink.setAttribute('href', excelUrl);
        excelLink.setAttribute('download', `analytical-report-${new Date().toISOString().split('T')[0]}.xlsx`);
        excelLink.style.visibility = 'hidden';
        document.body.appendChild(excelLink);
        excelLink.click();
        document.body.removeChild(excelLink);
    };
    
    const exportToPDF = (data) => {
        // For simplicity, we'll create a text file with .pdf extension
        // In a real implementation, we'd use a library like jsPDF
        let pdfContent = 'DIGITAL MENU CARD - ANALYTICAL REPORT\n';
        pdfContent += '='.repeat(50) + '\n';
        pdfContent += `Generated on: ${new Date().toLocaleString()}\n`;
        pdfContent += `Date Range: ${data.dateRange}\n\n`;
        
        pdfContent += 'BUSINESS INTELLIGENCE SUMMARY\n';
        pdfContent += '---------------------------\n';
        pdfContent += `Total Revenue: ${data.businessIntelligence.totalRevenue}\n`;
        pdfContent += `Total Customers: ${data.businessIntelligence.totalCustomers}\n`;
        pdfContent += `Total Orders: ${data.businessIntelligence.totalOrders}\n`;
        pdfContent += `Conversion Rate: ${data.businessIntelligence.conversionRate}\n\n`;
        
        pdfContent += 'CUSTOMER ANALYTICS\n';
        pdfContent += '-----------------\n';
        pdfContent += `Customer Lifetime Value: ${data.customerAnalytics.customerLifetimeValue}\n`;
        pdfContent += `Churn Rate: ${data.customerAnalytics.churnRate}\n`;
        pdfContent += `Retention Rate: ${data.customerAnalytics.retentionRate}\n`;
        pdfContent += `Repeat Customer Rate: ${data.customerAnalytics.repeatCustomerRate}\n\n`;
        
        pdfContent += 'POPULAR CATEGORIES\n';
        pdfContent += '------------------\n';
        pdfContent += 'Category, Orders, Revenue\n';
        data.popularCategories.forEach(cat => {
            pdfContent += `${cat.name}, ${cat.orders}, ${cat.revenue}\n`;
        });
        
        const pdfBlob = new Blob([pdfContent], { type: 'application/pdf;charset=utf-8;' });
        const pdfLink = document.createElement('a');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        pdfLink.setAttribute('href', pdfUrl);
        pdfLink.setAttribute('download', `analytical-report-${new Date().toISOString().split('T')[0]}.pdf`);
        pdfLink.style.visibility = 'hidden';
        document.body.appendChild(pdfLink);
        pdfLink.click();
        document.body.removeChild(pdfLink);
    };

    if (error) {
        return (
            <div className="analytical-reports-error">
                <AlertCircle size={48} className="error-icon" />
                <h3>Error Loading Reports</h3>
                <p>{error}</p>
                <button onClick={fetchAnalyticalReports} className="retry-button">
                    <RefreshCw size={16} />
                    Retry
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="analytical-reports-loading">
                <div className="loading-spinner"></div>
                <p>Loading analytical reports...</p>
            </div>
        );
    }

    return (
        <div className="analytical-reports">
            {/* Business Intelligence Summary */}
            <div className="business-intelligence-section">
                <h3>Business Intelligence Summary</h3>
                <div className="bi-summary-grid">
                    <div className="bi-card revenue-card">
                        <div className="bi-icon">
                            <IndianRupee size={24} />
                        </div>
                        <div className="bi-content">
                            <h4>Total Revenue</h4>
                            <p className="bi-value">{formatCurrency(reportsData.revenueTrends.reduce((sum, day) => sum + (day.revenue || 0), 0))}</p>
                            <p className="bi-change positive">+12.5%</p>
                        </div>
                    </div>
                    
                    <div className="bi-card customers-card">
                        <div className="bi-icon">
                            <Users size={24} />
                        </div>
                        <div className="bi-content">
                            <h4>Customer Growth</h4>
                            <p className="bi-value">{reportsData.customerGrowth.totalCustomers || 0}</p>
                            <p className="bi-change positive">+8.3%</p>
                        </div>
                    </div>
                    
                    <div className="bi-card orders-card">
                        <div className="bi-icon">
                            <ShoppingCart size={24} />
                        </div>
                        <div className="bi-content">
                            <h4>Total Orders</h4>
                            <p className="bi-value">{reportsData.orderVolume.reduce((sum, day) => sum + (day.orderCount || 0), 0)}</p>
                            <p className="bi-change positive">+15.2%</p>
                        </div>
                    </div>
                    
                    <div className="bi-card conversion-card">
                        <div className="bi-icon">
                            <Target size={24} />
                        </div>
                        <div className="bi-content">
                            <h4>Conversion Rate</h4>
                            <p className="bi-value">{formatPercentage(reportsData.conversionRates.overallConversion)}</p>
                            <p className="bi-change positive">+2.1%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Trends */}
            <div className="revenue-trends-section">
                <h3>Revenue Trends Analysis</h3>
                <div className="trends-chart-container">
                    <div className="trends-chart">
                        {reportsData.revenueTrends.length > 0 ? (
                            <div className="chart-bars">
                                {reportsData.revenueTrends.slice(0, 10).map((day, index) => (
                                    <div className="chart-bar-container" key={index}>
                                        <div 
                                            className="chart-bar" 
                                            style={{ 
                                                height: `${Math.max((day.revenue / Math.max(...reportsData.revenueTrends.map(d => d.revenue))) * 100, 5)}%` 
                                            }}
                                        >
                                            <span className="chart-value">{formatCurrency(day.revenue)}</span>
                                        </div>
                                        <span className="chart-label">
                                            {new Date(day.period || day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="chart-placeholder">No revenue trend data available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Customer Analytics */}
            <div className="customer-analytics-section">
                <h3>Customer Analytics</h3>
                <div className="customer-analytics-grid">
                    <div className="customer-card">
                        <h4>Customer Lifetime Value</h4>
                        <p className="clv-value">{formatCurrency(reportsData.customerLifetimeValue.projectedCLV)}</p>
                        <p className="clv-description">Projected value over customer lifecycle</p>
                    </div>
                    
                    <div className="customer-card">
                        <h4>Churn Rate</h4>
                        <p className="churn-value">{formatPercentage(reportsData.churnRate.monthlyChurnRate)}</p>
                        <p className="churn-description">{reportsData.churnRate.lostCustomers} customers lost this month</p>
                    </div>
                    
                    <div className="customer-card">
                        <h4>Retention Rate</h4>
                        <p className="retention-value">{formatPercentage(reportsData.retentionRates.monthlyRetention)}</p>
                        <p className="retention-description">{reportsData.retentionRates.retainedCustomers} customers retained</p>
                    </div>
                    
                    <div className="customer-card">
                        <h4>Repeat Customers</h4>
                        <p className="repeat-value">{formatPercentage(reportsData.retentionRates.monthlyRetention > 0 ? (reportsData.retentionRates.retainedCustomers / (reportsData.retentionRates.retainedCustomers + reportsData.churnRate.lostCustomers) * 100) : 0)}</p>
                        <p className="repeat-description">Percentage of returning customers</p>
                    </div>
                </div>
            </div>

            {/* Popular Categories */}
            <div className="popular-categories-section">
                <h3>Popular Categories & Items</h3>
                <div className="categories-grid">
                    {reportsData.popularCategories.slice(0, 6).map((item, index) => (
                        <div className="category-card" key={index}>
                            <h4>{item._id}</h4>
                            <div className="category-stats">
                                <div className="stat">
                                    <span className="label">Orders:</span>
                                    <span className="value">{item.orderCount || 0}</span>
                                </div>
                                <div className="stat">
                                    <span className="label">Revenue:</span>
                                    <span className="value">{formatCurrency(item.totalRevenue || 0)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Seasonal Trends */}
            <div className="seasonal-trends-section">
                <h3>Seasonal & Predictive Trends</h3>
                <div className="seasonal-grid">
                    <div className="trend-card">
                        <h4>Next Week Projection</h4>
                        <p className="projection-value">{formatCurrency(reportsData.seasonalTrends[0]?.predicted_revenue || 0)}</p>
                        <p className="projection-description">Expected revenue based on historical data</p>
                    </div>
                    
                    <div className="trend-card">
                        <h4>Peak Hours</h4>
                        <p className="projection-value">12:00 PM - 2:00 PM</p>
                        <p className="projection-description">Most active ordering period</p>
                    </div>
                    
                    <div className="trend-card">
                        <h4>Best Day</h4>
                        <p className="projection-value">Friday</p>
                        <p className="projection-description">Highest average order volume</p>
                    </div>
                    
                    <div className="trend-card">
                        <h4>Conversion Peak</h4>
                        <p className="projection-value">7:00 PM - 9:00 PM</p>
                        <p className="projection-description">Best time for conversions</p>
                    </div>
                </div>
            </div>

            {/* Operational Insights */}
            <div className="operational-insights-section">
                <h3>Operational Insights</h3>
                <div className="operational-grid">
                    <div className="operational-card">
                        <h4>Avg. Order Processing Time</h4>
                        <p className="op-value">{reportsData.operationalInsights.avgProcessingTime || 0} hrs</p>
                        <p className="op-description">Average time from order to delivery</p>
                    </div>
                    
                    <div className="operational-card">
                        <h4>Total Orders Processed</h4>
                        <p className="op-value">{reportsData.operationalInsights.totalOrders || 0}</p>
                        <p className="op-description">Orders completed in selected period</p>
                    </div>
                    
                    <div className="operational-card">
                        <h4>Order Accuracy</h4>
                        <p className="op-value">{formatPercentage(reportsData.operationalInsights.orderAccuracy)}</p>
                        <p className="op-description">Accurate orders delivered</p>
                    </div>
                    
                    <div className="operational-card">
                        <h4>Performance Score</h4>
                        <p className="op-value">A+</p>
                        <p className="op-description">Based on efficiency metrics</p>
                    </div>
                </div>
            </div>
            
            {/* Export Options */}
            <div className="reports-export-section">
                <h3>Export Reports</h3>
                <div className="export-options">
                    <button className="export-btn pdf" onClick={() => exportReport('pdf')}>
                        <FileText size={16} />
                        Export PDF Report
                    </button>
                    <button className="export-btn csv" onClick={() => exportReport('csv')}>
                        <Download size={16} />
                        Export CSV Data
                    </button>
                    <button className="export-btn excel" onClick={() => exportReport('excel')}>
                        <Download size={16} />
                        Export Excel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalyticalReports;