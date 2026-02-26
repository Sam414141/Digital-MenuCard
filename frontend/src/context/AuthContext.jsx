import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { API_CONFIG } from '../config/api';

/**
 * Authentication Context
 * Manages user authentication state, login, logout, and registration
 */

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Session configuration
    const SESSION_KEYS = {
        TOKEN: 'authToken',
        USER: 'userData',
        SESSION_ID: 'sessionId',
        EXPIRES_AT: 'sessionExpiresAt'
    };

    // Initialize authentication state on app startup
    useEffect(() => {
        initializeSession();
    }, []);

    // Set up token refresh interval
    useEffect(() => {
        if (isInitialized && token && user) {
            const refreshInterval = setInterval(() => {
                validateAndRefreshSession();
            }, 5 * 60 * 1000); // Check every 5 minutes

            return () => clearInterval(refreshInterval);
        }
    }, [isInitialized, token, user]);

    /**
     * Initialize session from stored data
     */
    const initializeSession = async () => {
        try {
            const storedToken = localStorage.getItem(SESSION_KEYS.TOKEN);
            const storedUser = localStorage.getItem(SESSION_KEYS.USER);
            const expiresAt = localStorage.getItem(SESSION_KEYS.EXPIRES_AT);

            // Check if session exists and is not expired
            if (storedToken && storedUser && expiresAt) {
                const now = new Date().getTime();
                const expiration = parseInt(expiresAt);

                if (now < expiration) {
                    try {
                        const userData = JSON.parse(storedUser);
                        setUser(userData);
                        setToken(storedToken);
                    } catch (parseError) {
                        console.error('❌ Failed to parse user data:', parseError);
                        clearSession();
                    }
                } else {
                    clearSession();
                }
            } else {
                clearSession();
            }
        } catch (error) {
            console.error('❌ Session initialization failed:', error);
            clearSession();
        } finally {
            setIsInitialized(true);
            setLoading(false);
        }
    };

    /**
     * Validate token with backend
     */
    const validateTokenWithBackend = async (tokenToValidate) => {
        try {
            const response = await apiService.getUserProfile();
            if (response.status === 'success') {
                const userData = response.data.profile;
                updateSession(tokenToValidate, userData);
                console.log('✅ Token validated with backend');
            } else {
                throw new Error('Invalid response from backend');
            }
        } catch (error) {
            console.error('❌ Token validation failed:', error);
            
            // Check if it's an authentication error
            const isAuthError = error.response?.status === 401 || 
                               error.status === 401 || 
                               error.message?.includes('401') ||
                               error.message?.includes('Unauthorized') ||
                               error.message?.includes('Invalid token') ||
                               error.message?.includes('Token expired');
            
            if (isAuthError) {
                console.log('🔒 Authentication error, clearing session');
                clearSession();
                throw error;
            } else {
                // Network error, keep session but don't update
                console.warn('⚠️ Network error during validation, keeping existing session');
            }
        }
    };

    /**
     * Validate and refresh session
     */
    const validateAndRefreshSession = async () => {
        const expiresAt = localStorage.getItem(SESSION_KEYS.EXPIRES_AT);
        if (!expiresAt) return;

        const now = new Date().getTime();
        const expiration = parseInt(expiresAt);
        const timeUntilExpiry = expiration - now;

        // If session expires in less than 10 minutes, try to refresh
        if (timeUntilExpiry < 10 * 60 * 1000 && timeUntilExpiry > 0) {
            console.log('🔄 Session expiring soon, attempting validation...');
            try {
                await validateTokenWithBackend(token);
            } catch (error) {
                console.error('Failed to refresh session:', error);
            }
        } else if (timeUntilExpiry <= 0) {
            console.log('⏰ Session expired, logging out');
            logout();
        }
    };

    /**
     * Update session with new data
     */
    const updateSession = (authToken, userData) => {
        const sessionId = generateSessionId();
        const expiresAt = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours
        
        // Store in localStorage
        localStorage.setItem(SESSION_KEYS.TOKEN, authToken);
        localStorage.setItem(SESSION_KEYS.USER, JSON.stringify(userData));
        localStorage.setItem(SESSION_KEYS.SESSION_ID, sessionId);
        localStorage.setItem(SESSION_KEYS.EXPIRES_AT, expiresAt.toString());
        
        // Update state
        setToken(authToken);
        setUser(userData);
        setError(null);
        
        console.log('✅ Session updated for user:', userData.email);
    };

    /**
     * Clear session data
     */
    const clearSession = () => {
        localStorage.removeItem(SESSION_KEYS.TOKEN);
        localStorage.removeItem(SESSION_KEYS.USER);
        localStorage.removeItem(SESSION_KEYS.EXPIRES_AT);
        localStorage.removeItem(SESSION_KEYS.SESSION_ID);
        
        setToken(null);
        setUser(null);
        setError(null);
        
    };

    /**
     * Generate unique session ID
     */
    const generateSessionId = () => {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     */
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            console.log('AuthContext: Attempting login with:', { email, password }); // Debug log
            const response = await apiService.login(email, password);
            console.log('AuthContext: Raw response:', response); // Debug log

            // Check if response exists and has the expected structure
            if (response && response.status === 'success') {
                const { user: userData, token: authToken } = response.data;
                console.log('AuthContext: Login successful, user:', userData); // Debug log
                
                // Update session with new data
                updateSession(authToken, userData);
                
                return { success: true, user: userData };
            } else {
                console.log('AuthContext: Login failed, response:', response); // Debug log
                throw new Error(response?.message || 'Login failed');
            }
        } catch (error) {
            console.error('❌ Login failed:', error.message);
            console.error('❌ Error details:', error); // Debug log
            // Handle network errors specifically
            let errorMessage = 'Login failed';
            if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
                errorMessage = 'Network error. Please check your connection and ensure the backend server is running.';
            } else if (error.response?.status === 401) {
                // More specific 401 error messages - but show generic message for security
                errorMessage = 'Invalid Email or Password';
            } else if (error.response?.status === 403) {
                errorMessage = 'Account is inactive. Please contact support.';
            } else if (error.response?.status === 429) {
                errorMessage = 'Too many login attempts. Please try again later.';
            } else {
                errorMessage = error.message || 'Login failed. Please try again.';
            }
            console.log('AuthContext: Setting error message:', errorMessage); // Debug log
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Register new user
     * @param {object} userData - User registration data
     */
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔐 Attempting registration for:', userData.email);

            const response = await apiService.register(userData);

            if (response.status === 'success') {
                const { user: newUser, token: authToken } = response.data;
                
                console.log('✅ Registration successful for:', newUser.email);
                
                // Update session with new data
                updateSession(authToken, newUser);
                
                return { success: true, user: newUser };
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error) {
            console.error('❌ Registration failed:', error.message);
            const errorMessage = error.message || 'Registration failed';
            setError(errorMessage);
            return { success: false, error: errorMessage, details: error.originalError?.response?.data };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Forgot password request
     * @param {string} email - User email
     */
    const forgotPassword = async (email) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📧 Sending password reset request for:', email);

            const response = await apiService.forgotPassword(email);

            if (response.status === 'success') {
                console.log('✅ Password reset request sent for:', email);
                return { success: true };
            } else {
                throw new Error(response.message || 'Password reset request failed');
            }
        } catch (error) {
            console.error('❌ Password reset request failed:', error.message);
            const errorMessage = error.message || 'Password reset request failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout user
     */
    const logout = () => {
        console.log('🚪 Logging out user');
        clearSession();
    };

    /**
     * Update user profile
     * @param {object} profileData - Updated profile data
     */
    const updateProfile = async (profileData) => {
        try {
            setError(null);
            const response = await apiService.updateUserProfile(profileData);
            
            if (response.status === 'success') {
                // Get fresh user data and update session
                const updatedResponse = await apiService.getUserProfile();
                if (updatedResponse.status === 'success') {
                    const updatedUser = updatedResponse.data.profile;
                    updateSession(token, updatedUser);
                }
                return { success: true };
            } else {
                throw new Error(response.message || 'Profile update failed');
            }
        } catch (error) {
            const errorMessage = error.message || 'Profile update failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Check if email is available
     * @param {string} email - Email to check
     */
    const checkEmailAvailability = async (email) => {
        try {
            const response = await apiService.validateEmail(email);
            return response.data.available;
        } catch (error) {
            console.error('Email validation error:', error);
            // Return null when availability cannot be determined (network/server error)
            return null;
        }
    };

    /**
     * Change password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     */
    const changePassword = async (currentPassword, newPassword) => {
        try {
            setError(null);
            const response = await apiService.changePassword(currentPassword, newPassword);
            
            if (response.status === 'success') {
                return { success: true };
            } else {
                throw new Error(response.message || 'Password change failed');
            }
        } catch (error) {
            const errorMessage = error.message || 'Password change failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Reset password using token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     */
    const resetPassword = async (token, newPassword) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔑 Attempting password reset');

            const response = await apiService.resetPassword(token, newPassword);

            if (response.status === 'success') {
                console.log('✅ Password reset successful');
                return { success: true };
            } else {
                throw new Error(response.message || 'Password reset failed');
            }
        } catch (error) {
            console.error('❌ Password reset failed:', error.message);
            const errorMessage = error.message || 'Password reset failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Clear error state
     */
    const clearError = () => {
        setError(null);
    };

    /**
     * Check if user has a specific role
     * @param {string} role - Role to check
     */
    const hasRole = (role) => {
        return user && user.role === role;
    };

    /**
     * Check if user has any of the specified roles
     * @param {array} roles - Array of roles to check
     */
    const hasAnyRole = (roles) => {
        return user && roles.includes(user.role);
    };

    /**
     * Check if user is admin
     */
    const isAdmin = () => {
        return user && user.role === 'admin';
    };

    /**
     * Check if user is staff (waiter, kitchen_staff, or admin)
     */
    const isStaff = () => {
        return user && ['waiter', 'kitchen_staff', 'admin'].includes(user.role);
    };

    /**
     * Check if user is waiter
     */
    const isWaiter = () => {
        return user && (user.role === 'waiter' || user.role === 'admin');
    };

    /**
     * Check if user is kitchen staff
     */
    const isKitchenStaff = () => {
        return user && (user.role === 'kitchen_staff' || user.role === 'admin');
    };

    const value = {
        user,
        token,
        loading,
        error,
        isAuthenticated: !!user && !!token,
        isInitialized,
        login,
        register,
        logout,
        updateProfile,
        checkEmailAvailability,
        changePassword,
        clearError,
        validateAndRefreshSession,
        
        // Role checking functions
        hasRole,
        hasAnyRole,
        isAdmin,
        isStaff,
        isWaiter,
        isKitchenStaff,
        
        // Session info (for debugging)
        sessionInfo: {
            hasToken: !!token,
            hasUser: !!user,
            expiresAt: localStorage.getItem(SESSION_KEYS.EXPIRES_AT),
            sessionId: localStorage.getItem(SESSION_KEYS.SESSION_ID)
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;