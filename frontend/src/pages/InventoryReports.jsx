import React, { useState } from 'react';
import { BarChart3, Package, TrendingUp, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import InventoryDashboard from '../components/InventoryDashboard';
import InventoryAnalytics from '../components/InventoryAnalytics';
import './InventoryReports.css';

const InventoryReports = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: <Package size={18} /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
        { id: 'trends', label: 'Trends', icon: <TrendingUp size={18} /> },
        { id: 'reports', label: 'Reports', icon: <FileText size={18} /> }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <InventoryDashboard />;
            case 'analytics':
                return <InventoryAnalytics />;
            case 'trends':
                return <div className="coming-soon">Advanced trend analysis coming soon...</div>;
            case 'reports':
                return <div className="coming-soon">Custom reports coming soon...</div>;
            default:
                return <InventoryDashboard />;
        }
    };

    return (
        <>
            <Navbar />
            <div className="inventory-reports">
                <div className="page-header">
                    <h1>
                        <BarChart3 />
                        Inventory Reports & Analytics
                    </h1>
                    <p>Comprehensive inventory insights and monitoring</p>
                </div>

                <div className="tabs-container">
                    <div className="tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="content-container">
                    {renderContent()}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default InventoryReports;