import { useState, createContext, useContext, useEffect } from "react";
import apiService from "../services/apiService";

const IpContext = createContext();

// Single source of truth for IP configuration
// Change this IP address here to update the entire frontend
const SERVER_IP = "localhost"; // <-- Use localhost for development

export const IpContextProvider = ({ children }) => {
    // Simple IP state - always uses the constant above
    const [ip, setIp] = useState(SERVER_IP);

    // Update API service when IP changes
    useEffect(() => {
        apiService.setServerIP(ip);
    }, [ip]);

    // Refresh IP function - always returns the constant IP
    const refreshIP = async () => {
        // In this simplified version, we just return the constant IP
        return SERVER_IP;
    };

    return (
        <IpContext.Provider value={{ ip, setIp, refreshIP }}>
            {children}
        </IpContext.Provider>
    );
};

// Custom hook for easier context usage
export const useIpContext = () => {
    const context = useContext(IpContext);
    if (!context) {
        // Fallback: return the constant IP instead of throwing
        console.warn('useIpContext called outside IpContextProvider, returning defaults');
        return {
            ip: SERVER_IP,
            setIp: () => console.warn('setIp called outside provider'),
            refreshIP: async () => SERVER_IP
        };
    }
    return context;
};