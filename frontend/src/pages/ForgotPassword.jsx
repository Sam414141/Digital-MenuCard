import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import '../styles/EnhancedAuth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { forgotPassword, error, loading, clearError } = useAuth();
    
    const [email, setEmail] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Clear errors when email changes
    useEffect(() => {
        clearError();
        setFormErrors({});
    }, [email, clearError]);

    const validateForm = () => {
        const errors = {};
        
        // Email validation
        if (!email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const result = await forgotPassword(email);
        
        if (result.success) {
            setIsSubmitted(true);
            setSuccessMessage('If an account with that email exists, a password reset link has been sent.');
        }
    };

    return (
        <div className="auth-background">
            <div className="auth-container">
                <div className="enhanced-auth-card">
                    <div className="enhanced-auth-header">
                        <div className="enhanced-auth-icon">
                            <Mail size={36} />
                        </div>
                        <h1>Forgot Password</h1>
                        <p>Enter your email to receive a password reset link</p>
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

                    {isSubmitted ? (
                        <div className="success-message">
                            <p>Please check your email for the password reset link.</p>
                            <p>If you don't see it, check your spam folder.</p>
                            <button
                                className="enhanced-auth-button"
                                onClick={() => navigate('/login')}
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : (
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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

                            <button
                                type="submit"
                                className="enhanced-auth-button"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="enhanced-loading-spinner">
                                        <div className="enhanced-spinner"></div>
                                        Sending Reset Link...
                                    </div>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>
                    )}

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

export default ForgotPassword;