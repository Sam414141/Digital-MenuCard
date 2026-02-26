/**
 * IP Detection Utility
 * Provides functions to detect and manage the current network IP address
 */

/**
 * Get current network IP address
 * @returns {Promise<string>} Current IP address
 */
export const getCurrentIP = async () => {
    try {
        // Try to get IP from a network request to determine local IP
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.warn('Could not detect public IP, falling back to localhost');
        return 'localhost';
    }
};

/**
 * Get local network IP address
 * @returns {Promise<string>} Local network IP address
 */
export const getLocalIP = () => {
    return new Promise((resolve) => {
        // Create a temporary RTCPeerConnection to discover local IP
        const pc = new RTCPeerConnection({
            iceServers: []
        });
        
        pc.createDataChannel('');
        pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .catch(() => {});
            
        pc.onicecandidate = (ice) => {
            if (!ice || !ice.candidate || !ice.candidate.candidate) return;
            const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
            pc.onicecandidate = () => {};
            resolve(myIP);
        };
        
        // Timeout after 5 seconds
        setTimeout(() => {
            resolve('10.195.82.46'); // Default fallback IP
        }, 5000);
    });
};

/**
 * Auto-detect and set the current IP
 * @param {function} setIpFunction - Function to set the IP in context
 */
export const autoDetectAndSetIP = async (setIpFunction) => {
    try {
        // First try to get local network IP
        const localIP = await getLocalIP();
        if (localIP && localIP !== '127.0.0.1' && localIP !== 'localhost') {
            setIpFunction(localIP);
            localStorage.setItem("serverIp", localIP);
            console.log('Auto-detected IP:', localIP);
            return localIP;
        }
        
        // Fallback to current IP from context
        const savedIp = localStorage.getItem("serverIp");
        if (savedIp) {
            setIpFunction(savedIp);
            return savedIp;
        }
        
        // Final fallback
        const fallbackIP = '10.195.82.46';
        setIpFunction(fallbackIP);
        localStorage.setItem("serverIp", fallbackIP);
        return fallbackIP;
    } catch (error) {
        console.error('Error detecting IP:', error);
        const fallbackIP = '10.195.82.46';
        setIpFunction(fallbackIP);
        localStorage.setItem("serverIp", fallbackIP);
        return fallbackIP;
    }
};

export default {
    getCurrentIP,
    getLocalIP,
    autoDetectAndSetIP
};