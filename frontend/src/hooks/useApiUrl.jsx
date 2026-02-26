/**
 * API URL Hook
 * Provides dynamic API URL based on IP context
 */

import { useIpContext } from '../context/IpContext';

const useApiUrl = () => {
    const { ip } = useIpContext();
    
    /**
     * Get the base API URL
     * @returns {string} Base API URL
     */
    const getBaseUrl = () => {
        // Always use the IP from context with HTTPS on port 443
        return `https://${ip}:443`;
    };

    /**
     * Build complete API URL
     * @param {string} endpoint - The endpoint path
     * @returns {string} Complete API URL
     */
    const buildUrl = (endpoint) => {
        const baseUrl = getBaseUrl();
        // Remove leading slash if present to avoid double slashes
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${baseUrl}${cleanEndpoint}`;
    };

    return {
        baseUrl: getBaseUrl(),
        buildUrl,
        ip
    };
};

export default useApiUrl;