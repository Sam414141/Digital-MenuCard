import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import '../styles/EnhancedAuth.css';

const EnhancedLoginForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, error, loading, isAuthenticated, user, clearError, isAdmin, isStaff } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [generalError, setGeneralError] = useState(""); // For login failure messages

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            // Redirect based on user role
            const redirectTo = getRedirectPath();
            navigate(redirectTo, { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Check for success message from registration
    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Clear the state to prevent showing message on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    // Clear general error message when user starts typing
    useEffect(() => {
        if (generalError) {
            const timer = setTimeout(() => {
                // Error will be cleared by handleChange when user types
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [generalError]);

    // Determine redirect path based on user role
    const getRedirectPath = () => {
        // Check if there's a specific redirect path from the location state
        const from = location.state?.from?.pathname;
        if (from && from !== '/login') {
            return from;
        }

        // Default redirect paths based on role
        if (isAdmin()) {
            return '/admin/dashboard';
        } else if (isStaff()) {
            // Redirect to specific dashboard based on staff role
            if (user && user.role === 'kitchen_staff') {
                return '/staff/kitchen';
            } else if (user && user.role === 'waiter') {
                return '/staff/waiter-dashboard';
            } else {
                return '/staff/dashboard';
            }
        } else {
            return '/menu';
        }
    };

    // Handle input changes (matching registration form behavior)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear specific field error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        
        // Clear general error when user starts typing in any field
        if (generalError) {
            setGeneralError("");
        }
        
        // Clear auth context error when user starts typing
        if (error) {
            clearError();
        }
    };

    // Validate form inputs (matching registration form behavior)
    const validateForm = () => {
        const errors = {};
        
        // Email validation
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission with proper error handling
    const handleSubmit = async (e) => {
        // Prevent default form submission and page refresh
        e.preventDefault();
        console.log('📝 Login form submitted');
        
        if (!validateForm()) {
            console.log('❌ Form validation failed');
            return;
        }

        // Clear any previous errors before attempting login
        clearError();
        setFormErrors({});
        setGeneralError("");
        console.log('🔄 Attempting login...');
        
        try {
            const result = await login(formData.email, formData.password);
            console.log('📦 Login result:', result);
            
            if (result.success) {
                // Redirect based on user role
                const redirectTo = getRedirectPath();
                console.log('✅ Login successful, redirecting to:', redirectTo);
                navigate(redirectTo, { replace: true });
            } else {
                // Handle login failure - show error message
                const errorMessage = result.error || 'Invalid email or password';
                console.log('❌ Login failed:', errorMessage);
                setGeneralError(errorMessage);
            }
        } catch (error) {
            // Handle network errors or unexpected issues
            console.error('💥 Login error caught:', error);
            const errorMessage = 'Invalid email or password';
            setGeneralError(errorMessage);
        }
    };

    return (
        <div className="auth-background">
            <div className="auth-container">
                <div className="enhanced-auth-card">
                    <div className="enhanced-auth-header">
                        <div className="enhanced-auth-icon">
                            <User size={36} />
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to your account to continue</p>
                    </div>

                    {successMessage && (
                        <div className="alert alert-success">
                            <CheckCircle size={20} />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* General error message for failed login attempts */}
                    {generalError && (
                        <div className="alert alert-error">
                            <AlertCircle size={20} />
                            <span>{generalError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="enhanced-auth-form">
                        <div className="enhanced-form-group">
                            <label htmlFor="email">
                                <Mail size={18} />
                                Email Address
                            </label>
                            <div className="enhanced-input-wrapper">
                                <Mail className="enhanced-input-icon" size={20} />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className={formErrors.email ? 'error' : ''}
                                    disabled={loading}
                                />
                            </div>
                            {formErrors.email && (
                                <div className="enhanced-error-text">
                                    <AlertCircle size={16} />
                                    {formErrors.email}
                                </div>
                            )}
                        </div>

                        <div className="enhanced-form-group">
                            <label htmlFor="password">
                                <Lock size={18} />
                                Password
                            </label>
                            <div className="enhanced-input-wrapper">
                                <Lock className="enhanced-input-icon" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className={formErrors.password ? 'error' : ''}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="enhanced-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {formErrors.password && (
                                <div className="enhanced-error-text">
                                    <AlertCircle size={16} />
                                    {formErrors.password}
                                </div>
                            )}
                        </div>

                        <div className="enhanced-form-actions">
                            <Link to="/forgot-password" className="enhanced-forgot-link">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="enhanced-auth-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="enhanced-loading-spinner">
                                    <div className="enhanced-spinner"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="enhanced-auth-footer">
                        <p>
                            Don't have an account?{' '}
                            <Link to="/register" className="enhanced-auth-link">
                                Sign up here
                            </Link>
                        </p>
                    </div>

                    <div className="enhanced-guest-option">
                        <p>Or continue as guest</p>
                        <Link to="/menu" className="enhanced-guest-button">
                            Browse Menu
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedLoginForm;