import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import '../styles/EnhancedAuth.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { resetPassword, error, loading, clearError } = useAuth();
    
    const [formData, setFormData] = useState({
        token: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        newPassword: false,
        confirmPassword: false
    });
    const [formErrors, setFormErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isTokenValid, setIsTokenValid] = useState(true);

    // Get token from URL parameters
    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            setFormData(prev => ({
                ...prev,
                token
            }));
        } else {
            setIsTokenValid(false);
        }
    }, [searchParams]);

    // Clear errors when form data changes
    useEffect(() => {
        clearError();
        setFormErrors({});
    }, [formData, clearError]);

    const handleInputChange = (e) => {
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
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = () => {
        const errors = {};
        
        // New password validation
        if (!formData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 8) {
            errors.newPassword = 'Password must be at least 8 characters long';
        }
        
        // Confirm password validation
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const result = await resetPassword(formData.token, formData.newPassword);
        
        if (result.success) {
            setSuccessMessage('Password successfully reset! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
    };

    if (!isTokenValid) {
        return (
            <div className="auth-background">
                <div className="auth-container">
                    <div className="enhanced-auth-card">
                        <div className="enhanced-auth-header">
                            <div className="enhanced-auth-icon">
                                <Lock size={36} />
                            </div>
                            <h1>Invalid Reset Link</h1>
                            <p>The password reset link is invalid or has expired.</p>
                        </div>
                        
                        <div className="alert alert-error">
                            <AlertCircle size={20} />
                            <span>Please request a new password reset link.</span>
                        </div>
                        
                        <button
                            className="enhanced-auth-button"
                            onClick={() => navigate('/login')}
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-background">
            <div className="auth-container">
                <div className="enhanced-auth-card">
                    <div className="enhanced-auth-header">
                        <div className="enhanced-auth-icon">
                            <Lock size={36} />
                        </div>
                        <h1>Reset Password</h1>
                        <p>Enter your new password below</p>
                    </div>

                    {successMessage && (
                        <div className="alert alert-success">
                            <CheckCircle size={20} />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-error">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="enhanced-auth-form">
                        <div className="enhanced-form-group">
                            <label htmlFor="newPassword">
                                <Lock size={18} />
                                New Password
                            </label>
                            <div className="enhanced-input-wrapper">
                                <Lock className="enhanced-input-icon" size={20} />
                                <input
                                    type={showPassword.newPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    placeholder="Enter new password"
                                    className={formErrors.newPassword ? 'error' : ''}
                                    disabled={loading || successMessage}
                                />
                                <button
                                    type="button"
                                    className="enhanced-password-toggle"
                                    onClick={() => togglePasswordVisibility('newPassword')}
                                    disabled={loading || successMessage}
                                >
                                    {showPassword.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {formErrors.newPassword && (
                                <div className="enhanced-error-text">
                                    <AlertCircle size={16} />
                                    {formErrors.newPassword}
                                </div>
                            )}
                        </div>

                        <div className="enhanced-form-group">
                            <label htmlFor="confirmPassword">
                                <Lock size={18} />
                                Confirm Password
                            </label>
                            <div className="enhanced-input-wrapper">
                                <Lock className="enhanced-input-icon" size={20} />
                                <input
                                    type={showPassword.confirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm new password"
                                    className={formErrors.confirmPassword ? 'error' : ''}
                                    disabled={loading || successMessage}
                                />
                                <button
                                    type="button"
                                    className="enhanced-password-toggle"
                                    onClick={() => togglePasswordVisibility('confirmPassword')}
                                    disabled={loading || successMessage}
                                >
                                    {showPassword.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {formErrors.confirmPassword && (
                                <div className="enhanced-error-text">
                                    <AlertCircle size={16} />
                                    {formErrors.confirmPassword}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="enhanced-auth-button"
                            disabled={loading || successMessage}
                        >
                            {loading ? (
                                <div className="enhanced-loading-spinner">
                                    <div className="enhanced-spinner"></div>
                                    Resetting Password...
                                </div>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

                    <div className="enhanced-auth-footer">
                        <p>
                            Remember your password?{' '}
                            <Link to="/login" className="enhanced-auth-link">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;