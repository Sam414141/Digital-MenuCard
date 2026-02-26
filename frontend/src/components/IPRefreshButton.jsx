import React from 'react';
import { useIpContext } from '../context/IpContext';

const IPRefreshButton = ({ className, children }) => {
    const { refreshIP } = useIpContext();
    
    const handleRefresh = async () => {
        try {
            const newIP = await refreshIP();
            alert(`IP refreshed successfully! New IP: ${newIP}`);
        } catch (error) {
            console.error('Error refreshing IP:', error);
            alert('Failed to refresh IP. Please check your network connection.');
        }
    };
    
    return (
        <button 
            onClick={handleRefresh}
            className={className}
            title="Refresh IP Address"
        >
            {children || '🔄 Refresh IP'}
        </button>
    );
};

export default IPRefreshButton;