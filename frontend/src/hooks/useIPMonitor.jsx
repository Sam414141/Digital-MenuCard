import { useEffect } from 'react';
import { useIpContext } from '../context/IpContext';

/**
 * IP Monitor Hook
 * Periodically checks and updates the IP address
 * @param {number} interval - Check interval in milliseconds (default: 30000ms/30s)
 */
const useIPMonitor = (interval = 30000) => {
    const { ip, refreshIP } = useIpContext();
    
    useEffect(() => {
        // Only monitor if we're not using localhost
        if (ip === 'localhost' || ip === '127.0.0.1') {
            return;
        }
        
        const intervalId = setInterval(async () => {
            try {
                // Refresh IP and check if it changed
                const newIP = await refreshIP();
                if (newIP !== ip) {
                    console.log(`IP changed from ${ip} to ${newIP}`);
                }
            } catch (error) {
                console.error('Error monitoring IP:', error);
            }
        }, interval);
        
        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [ip, refreshIP, interval]);
};

export default useIPMonitor;