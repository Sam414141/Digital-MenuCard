import React, { useState, useEffect } from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    TrendingDown, 
    Calendar,
    Download,
    RefreshCw,
    Package,
    AlertTriangle,
    Clock,
    IndianRupee
} from 'lucide-react';
import apiService from '../services/apiService'; // Use apiService instead of axios
import './InventoryAnalytics.css';

const InventoryAnalytics = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            // Use apiService instead of direct axios call
            const response = await apiService.getInventoryReport();
            setReportData(response);
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = () => {
        if (!reportData) return;

        const csvContent = [
            ['Ingredient Name', 'Current Stock', 'Unit', 'Total Used', 'Reorder Level', 'Days Remaining'],
            ...reportData.inventory_turnover.map(item => [
                item.ingredient_name,
                item.current_stock,
                item.unit,
                item.total_used,
                item.reorder_level,
                item.days_of_stock_remaining ? Math.round(item.days_of_stock_remaining) : 'N/A'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-report-${dateRange.from}-to-${dateRange.to}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    if (loading) {
        return (
            <div className="inventory-analytics loading">
                <RefreshCw className="spinning" size={32} />
                <p>Loading inventory analytics...</p>
            </div>
        );
    }

    const topUsedItems = reportData?.inventory_turnover?.slice(0, 5) || [];
    const lowStockItems = reportData?.inventory_turnover?.filter(item => 
        item.current_stock <= item.reorder_level
    ) || [];
    const criticalItems = lowStockItems.filter(item => 
        item.current_stock <= (item.reorder_level * 0.5)
    );

    return (
        <div className="inventory-analytics">
            <div className="analytics-header">
                <div className="header-content">
                    <h2>
                        <BarChart3 />
                        Inventory Analytics
                    </h2>
                    <div className="header-controls">
                        <div className="date-range">
                            <label>From:</label>
                            <input
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                            />
                            <label>To:</label>
                            <input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                            />
                        </div>
                        <button className="export-btn" onClick={exportReport}>
                            <Download size={16} />
                            Export CSV
                        </button>
                        <button className="refresh-btn" onClick={fetchReportData}>
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card">
                    <div className="card-icon">
                        <Package />
                    </div>
                    <div className="card-content">
                        <h3>Total Ingredients</h3>
                        <div className="card-value">{reportData?.summary?.total_ingredients || 0}</div>
                    </div>
                </div>

                <div className="summary-card warning">
                    <div className="card-icon">
                        <AlertTriangle />
                    </div>
                    <div className="card-content">
                        <h3>Low Stock Items</h3>
                        <div className="card-value">{lowStockItems.length}</div>
                    </div>
                </div>

                <div className="summary-card danger">
                    <div className="card-icon">
                        <TrendingDown />
                    </div>
                    <div className="card-content">
                        <h3>Critical Items</h3>
                        <div className="card-value">{criticalItems.length}</div>
                    </div>
                </div>

                <div className="summary-card info">
                    <div className="card-icon">
                        <BarChart3 />
                    </div>
                    <div className="card-content">
                        <h3>Total Stock Units</h3>
                        <div className="card-value">{Math.round(reportData?.summary?.total_stock_units || 0)}</div>
                    </div>
                </div>
            </div>

            {/* Top Used Items */}
            <div className="analytics-section">
                <h3>Top Used Ingredients</h3>
                <div className="top-used-grid">
                    {topUsedItems.map((item, index) => (
                        <div key={item.ingredient_name} className="usage-item">
                            <div className="usage-rank">#{index + 1}</div>
                            <div className="usage-info">
                                <h4>{item.ingredient_name}</h4>
                                <div className="usage-details">
                                    <span className="used-amount">
                                        <TrendingDown size={14} />
                                        {item.total_used} {item.unit} used
                                    </span>
                                    <span className="current-stock">
                                        <Package size={14} />
                                        {item.current_stock} {item.unit} remaining
                                    </span>
                                    {item.days_of_stock_remaining && (
                                        <span className="days-remaining">
                                            <Clock size={14} />
                                            {Math.round(item.days_of_stock_remaining)} days left
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className={`usage-progress ${item.current_stock <= item.reorder_level ? 'low' : 'normal'}`}>
                                <div 
                                    className="progress-bar"
                                    style={{
                                        width: `${Math.min(100, (item.current_stock / (item.reorder_level * 2)) * 100)}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stock Status Analysis */}
            <div className="analytics-section">
                <h3>Stock Status Analysis</h3>
                <div className="stock-analysis">
                    <div className="analysis-chart">
                        <div className="chart-item good">
                            <div className="chart-bar" style={{
                                height: `${((reportData?.summary?.total_ingredients - lowStockItems.length) / reportData?.summary?.total_ingredients * 100) || 0}%`
                            }}></div>
                            <div className="chart-label">
                                <span className="count">{(reportData?.summary?.total_ingredients || 0) - lowStockItems.length}</span>
                                <span className="label">Good Stock</span>
                            </div>
                        </div>
                        <div className="chart-item warning">
                            <div className="chart-bar" style={{
                                height: `${((lowStockItems.length - criticalItems.length) / reportData?.summary?.total_ingredients * 100) || 0}%`
                            }}></div>
                            <div className="chart-label">
                                <span className="count">{lowStockItems.length - criticalItems.length}</span>
                                <span className="label">Low Stock</span>
                            </div>
                        </div>
                        <div className="chart-item danger">
                            <div className="chart-bar" style={{
                                height: `${(criticalItems.length / reportData?.summary?.total_ingredients * 100) || 0}%`
                            }}></div>
                            <div className="chart-label">
                                <span className="count">{criticalItems.length}</span>
                                <span className="label">Critical</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Inventory Table */}
            <div className="analytics-section">
                <h3>Detailed Inventory Report</h3>
                <div className="inventory-table-container">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Ingredient</th>
                                <th>Current Stock</th>
                                <th>Unit</th>
                                <th>Used (Period)</th>
                                <th>Reorder Level</th>
                                <th>Days Remaining</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData?.inventory_turnover?.map(item => (
                                <tr key={item.ingredient_name} className={`
                                    ${item.current_stock <= (item.reorder_level * 0.5) ? 'critical' : 
                                      item.current_stock <= item.reorder_level ? 'warning' : 'normal'}
                                `}>
                                    <td className="ingredient-name">{item.ingredient_name}</td>
                                    <td className="stock-amount">{item.current_stock}</td>
                                    <td className="unit">{item.unit}</td>
                                    <td className="used-amount">{item.total_used}</td>
                                    <td className="reorder-level">{item.reorder_level}</td>
                                    <td className="days-remaining">
                                        {item.days_of_stock_remaining ? 
                                            `${Math.round(item.days_of_stock_remaining)} days` : 
                                            'N/A'
                                        }
                                    </td>
                                    <td className="status">
                                        <span className={`status-badge ${
                                            item.current_stock <= (item.reorder_level * 0.5) ? 'critical' :
                                            item.current_stock <= item.reorder_level ? 'warning' : 'good'
                                        }`}>
                                            {item.current_stock <= (item.reorder_level * 0.5) ? 'Critical' :
                                             item.current_stock <= item.reorder_level ? 'Low' : 'Good'}
                                        </span>
                                    </td>
                                </tr>
                            )) || []}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recommendations */}
            {(criticalItems.length > 0 || lowStockItems.length > 0) && (
                <div className="analytics-section">
                    <h3>Recommendations</h3>
                    <div className="recommendations">
                        {criticalItems.length > 0 && (
                            <div className="recommendation critical">
                                <AlertTriangle size={20} />
                                <div className="recommendation-content">
                                    <h4>Immediate Action Required</h4>
                                    <p>
                                        {criticalItems.length} ingredients are critically low. 
                                        Order immediately: {criticalItems.slice(0, 3).map(item => item.ingredient_name).join(', ')}
                                        {criticalItems.length > 3 && ` and ${criticalItems.length - 3} more`}
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {lowStockItems.length > criticalItems.length && (
                            <div className="recommendation warning">
                                <TrendingDown size={20} />
                                <div className="recommendation-content">
                                    <h4>Reorder Soon</h4>
                                    <p>
                                        {lowStockItems.length - criticalItems.length} ingredients are below reorder level. 
                                        Plan to restock within the next few days.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="recommendation info">
                            <Clock size={20} />
                            <div className="recommendation-content">
                                <h4>Usage Trend</h4>
                                <p>
                                    Based on current usage patterns, consider increasing reorder levels for 
                                    frequently used ingredients to prevent stockouts.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryAnalytics;