import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, AlertCircle, CheckCircle, Check, X } from 'lucide-react';
import '../styles/EnhancedAuth.css';

const EnhancedRegisterForm = () => {
    const navigate = useNavigate();
    const { register, checkEmailAvailability, error, loading, isAuthenticated, clearError } = useAuth();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        dateOfBirth: ''
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        requirements: {
            minLength: false,
            hasUpperCase: false,
            hasLowerCase: false,
            hasNumbers: false,
            hasSpecialChar: false
        }
    });
    const [emailAvailable, setEmailAvailable] = useState(null);
    const [emailChecking, setEmailChecking] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/menu', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Clear errors when form data changes
    useEffect(() => {
        clearError();
        setFormErrors({});
    }, [formData, clearError]);

    // Password strength checker
    useEffect(() => {
        const password = formData.password;
        const requirements = {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        const score = Object.values(requirements).filter(Boolean).length;
        
        setPasswordStrength({ score, requirements });
    }, [formData.password]);

    // Email availability checker (debounced)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                setEmailChecking(true);
                try {
                    const available = await checkEmailAvailability(formData.email);
                    setEmailAvailable(available);
                } catch (error) {
                    console.error('Email check failed:', error);
                    setEmailAvailable(null);
                } finally {
                    setEmailChecking(false);
                }
            } else {
                setEmailAvailable(null);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.email, checkEmailAvailability]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear field-specific error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        
        // First name validation
        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required';
        } else if (formData.firstName.trim().length < 2) {
            errors.firstName = 'First name must be at least 2 characters';
        }
        
        // Last name validation
        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required';
        } else if (formData.lastName.trim().length < 2) {
            errors.lastName = 'Last name must be at least 2 characters';
        }
        
        // Email validation
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        } else if (emailAvailable === false) {
            errors.email = 'This email is already registered';
        }
        
        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (passwordStrength.score < 5) {
            errors.password = 'Password must meet all requirements';
        }
        
        // Confirm password validation
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        // Phone validation (optional but if provided should be valid)
        if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            errors.phone = 'Please enter a valid 10-digit phone number';
        }
        
        // Date of birth validation (optional but if provided should be valid)
        if (formData.dateOfBirth) {
            const birthDate = new Date(formData.dateOfBirth);
            const today = new Date();
            const minAge = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
            
            if (birthDate > minAge) {
                errors.dateOfBirth = 'You must be at least 13 years old';
            }
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const registrationData = {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
            phone: formData.phone || undefined,
            dateOfBirth: formData.dateOfBirth || undefined
        };

        const result = await register(registrationData);
        
        if (result.success) {
            navigate('/login', { 
                state: { 
                    message: 'Registration successful! Please sign in with your new account.' 
                },
                replace: true 
            });
        }
    };
 
    const getPasswordStrengthColor = () => {
        if (passwordStrength.score < 2) return 'weak';
        if (passwordStrength.score < 4) return 'medium';
        return 'strong';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength.score < 2) return 'Weak';
        if (passwordStrength.score < 4) return 'Medium';
        return 'Strong';
    };

    return (
        <div className="auth-background">
            <div className="auth-container">
                <div className="enhanced-auth-card register-card">
                    <div className="enhanced-auth-header">
                        <div className="enhanced-auth-icon">
                            <User size={36} />
                        </div>
                        <h1>Create Account</h1>
                        <p>Join us for a personalized dining experience</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="enhanced-auth-form">
                        <div className="enhanced-form-row">
                            <div className="enhanced-form-group">
                                <label htmlFor="firstName">
                                    <User size={18} />
                                    First Name
                                </label>
                                <div className="enhanced-input-wrapper">
                                    <User className="enhanced-input-icon" size={20} />
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your first name"
                                        className={formErrors.firstName ? 'error' : ''}
                                        disabled={loading}
                                    />
                                </div>
                                {formErrors.firstName && (
                                    <div className="enhanced-error-text">
                                        <AlertCircle size={16} />
                                        {formErrors.firstName}
                                    </div>
                                )}
                            </div>

                            <div className="enhanced-form-group">
                                <label htmlFor="lastName">
                                    <User size={18} />
                                    Last Name
                                </label>
                                <div className="enhanced-input-wrapper">
                                    <User className="enhanced-input-icon" size={20} />
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your last name"
                                        className={formErrors.lastName ? 'error' : ''}
                                        disabled={loading}
                                    />
                                </div>
                                {formErrors.lastName && (
                                    <div className="enhanced-error-text">
                                        <AlertCircle size={16} />
                                        {formErrors.lastName}
                                    </div>
                                )}
                            </div>
                        </div>

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
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                    className={`${formErrors.email ? 'error' : ''} ${emailAvailable === false ? 'error' : ''}`}
                                    disabled={loading}
                                />
                                {(emailChecking || emailAvailable !== null) && (
                                    <div className={`enhanced-email-status ${emailChecking ? 'checking' : emailAvailable ? 'available' : 'unavailable'}`}>
                                        {emailChecking ? (
                                            <div className="enhanced-spinner" style={{width: '16px', height: '16px'}}></div>
                                        ) : emailAvailable ? (
                                            <Check size={16} />
                                        ) : (
                                            <X size={16} />
                                        )}
                                    </div>
                                )}
                            </div>
                            {formErrors.email && (
                                <div className="enhanced-error-text">
                                    <AlertCircle size={16} />
                                    {formErrors.email}
                                </div>
                            )}
                            {!formErrors.email && emailAvailable === false && (
                                <div className="enhanced-error-text">
                                    <AlertCircle size={16} />
                                    This email is already registered
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
                                    onChange={handleInputChange}
                                    placeholder="Create a password"
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
                            <div className="enhanced-password-strength">
                                <div className="enhanced-strength-bar">
                                    <div className={`enhanced-strength-fill ${getPasswordStrengthColor()}`}></div>
                                </div>
                                <span className={`enhanced-strength-text ${getPasswordStrengthColor()}`}>
                                    {getPasswordStrengthText()}
                                </span>
                            </div>
                            <div className="enhanced-password-requirements">
                                <div className={`enhanced-requirement ${passwordStrength.requirements.minLength ? 'met' : 'unmet'}`}>
                                    {passwordStrength.requirements.minLength ? <Check size={14} /> : <X size={14} />}
                                    At least 8 characters
                                </div>
                                <div className={`enhanced-requirement ${passwordStrength.requirements.hasUpperCase ? 'met' : 'unmet'}`}>
                                    {passwordStrength.requirements.hasUpperCase ? <Check size={14} /> : <X size={14} />}
                                    One uppercase letter
                                </div>
                                <div className={`enhanced-requirement ${passwordStrength.requirements.hasLowerCase ? 'met' : 'unmet'}`}>
                                    {passwordStrength.requirements.hasLowerCase ? <Check size={14} /> : <X size={14} />}
                                    One lowercase letter
                                </div>
                                <div className={`enhanced-requirement ${passwordStrength.requirements.hasNumbers ? 'met' : 'unmet'}`}>
                                    {passwordStrength.requirements.hasNumbers ? <Check size={14} /> : <X size={14} />}
                                    One number
                                </div>
                                <div className={`enhanced-requirement ${passwordStrength.requirements.hasSpecialChar ? 'met' : 'unmet'}`}>
                                    {passwordStrength.requirements.hasSpecialChar ? <Check size={14} /> : <X size={14} />}
                                    One special character
                                </div>
                            </div>
                            {formErrors.password && (
                                <div className="enhanced-error-text">
                                    <AlertCircle size={16} />
                                    {formErrors.password}
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
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm your password"
                                    className={formErrors.confirmPassword ? 'error' : ''}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="enhanced-password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={loading}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {formErrors.confirmPassword && (
                                <div className="enhanced-error-text">
                                    <AlertCircle size={16} />
                                    {formErrors.confirmPassword}
                                </div>
                            )}
                        </div>

                        <div className="enhanced-form-row">
                            <div className="enhanced-form-group">
                                <label htmlFor="phone">
                                    <Phone size={18} />
                                    Phone Number
                                </label>
                                <div className="enhanced-input-wrapper">
                                    <Phone className="enhanced-input-icon" size={20} />
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="(123) 456-7890"
                                        className={formErrors.phone ? 'error' : ''}
                                        disabled={loading}
                                    />
                                </div>
                                {formErrors.phone && (
                                    <div className="enhanced-error-text">
                                        <AlertCircle size={16} />
                                        {formErrors.phone}
                                    </div>
                                )}
                            </div>

                            <div className="enhanced-form-group">
                                <label htmlFor="dateOfBirth">
                                    <Calendar size={18} />
                                    Date of Birth
                                </label>
                                <div className="enhanced-input-wrapper">
                                    <Calendar className="enhanced-input-icon" size={20} />
                                    <input
                                        type="date"
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className={formErrors.dateOfBirth ? 'error' : ''}
                                        disabled={loading}
                                    />
                                </div>
                                {formErrors.dateOfBirth && (
                                    <div className="enhanced-error-text">
                                        <AlertCircle size={16} />
                                        {formErrors.dateOfBirth}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="enhanced-auth-button"
                            disabled={loading || emailChecking || emailAvailable === false}
                        >
                            {loading ? (
                                <div className="enhanced-loading-spinner">
                                    <div className="enhanced-spinner"></div>
                                    Creating account...
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="enhanced-auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login" className="enhanced-auth-link">
                                Sign in here
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

export default EnhancedRegisterForm;