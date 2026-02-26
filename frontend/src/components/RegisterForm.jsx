import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, AlertCircle, CheckCircle, Check, X } from 'lucide-react';
import './AuthForm.css';

const RegisterForm = () => {
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
        <div className="auth-container">
            <div className="auth-card register-card">
                <div className="auth-header">
                    <div className="auth-icon">
                        <User size={32} />
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

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name *</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={20} />
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="First name"
                                    className={formErrors.firstName ? 'error' : ''}
                                    autoComplete="given-name"
                                    disabled={loading}
                                />
                            </div>
                            {formErrors.firstName && (
                                <span className="error-text">{formErrors.firstName}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Last Name *</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={20} />
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Last name"
                                    className={formErrors.lastName ? 'error' : ''}
                                    autoComplete="family-name"
                                    disabled={loading}
                                />
                            </div>
                            {formErrors.lastName && (
                                <span className="error-text">{formErrors.lastName}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                className={formErrors.email ? 'error' : ''}
                                autoComplete="email"
                                disabled={loading}
                            />
                            {emailChecking && (
                                <div className="email-status checking">Checking...</div>
                            )}
                            {emailAvailable === true && (
                                <div className="email-status available">
                                    <Check size={16} />
                                </div>
                            )}
                            {emailAvailable === false && (
                                <div className="email-status unavailable">
                                    <X size={16} />
                                </div>
                            )}
                        </div>
                        {formErrors.email && (
                            <span className="error-text">{formErrors.email}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Create a password"
                                className={formErrors.password ? 'error' : ''}
                                autoComplete="new-password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        
                        {formData.password && (
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div 
                                        className={`strength-fill ${getPasswordStrengthColor()}`}
                                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                    ></div>
                                </div>
                                <span className={`strength-text ${getPasswordStrengthColor()}`}>
                                    {getPasswordStrengthText()}
                                </span>
                            </div>
                        )}
                        
                        {formData.password && (
                            <div className="password-requirements">
                                {Object.entries(passwordStrength.requirements).map(([key, met]) => (
                                    <div key={key} className={`requirement ${met ? 'met' : 'unmet'}`}>
                                        {met ? <Check size={14} /> : <X size={14} />}
                                        <span>
                                            {key === 'minLength' && 'At least 8 characters'}
                                            {key === 'hasUpperCase' && 'One uppercase letter'}
                                            {key === 'hasLowerCase' && 'One lowercase letter'}
                                            {key === 'hasNumbers' && 'One number'}
                                            {key === 'hasSpecialChar' && 'One special character'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {formErrors.password && (
                            <span className="error-text">{formErrors.password}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password *</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm your password"
                                className={formErrors.confirmPassword ? 'error' : ''}
                                autoComplete="new-password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={loading}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {formErrors.confirmPassword && (
                            <span className="error-text">{formErrors.confirmPassword}</span>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <div className="input-wrapper">
                                <Phone className="input-icon" size={20} />
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="(123) 456-7890"
                                    className={formErrors.phone ? 'error' : ''}
                                    autoComplete="tel"
                                    disabled={loading}
                                />
                            </div>
                            {formErrors.phone && (
                                <span className="error-text">{formErrors.phone}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="dateOfBirth">Date of Birth</label>
                            <div className="input-wrapper">
                                <Calendar className="input-icon" size={20} />
                                <input
                                    type="date"
                                    id="dateOfBirth"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    className={formErrors.dateOfBirth ? 'error' : ''}
                                    autoComplete="bday"
                                    disabled={loading}
                                />
                            </div>
                            {formErrors.dateOfBirth && (
                                <span className="error-text">{formErrors.dateOfBirth}</span>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading || emailChecking || emailAvailable === false}
                    >
                        {loading ? (
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                Creating account...
                            </div>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Sign in here
                        </Link>
                    </p>
                </div>

                <div className="guest-option">
                    <p>Or continue as guest</p>
                    <Link to="/menu" className="guest-button">
                        Browse Menu
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;