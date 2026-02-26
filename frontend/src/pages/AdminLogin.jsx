import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService";
import "../styles/AdminLogin.css";
import { useIpContext } from "../context/IpContext";
import { AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes and clear errors
  const handleInputChange = (field, value) => {
    if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    }
    
    // Clear field-specific error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear general error when user starts typing in any field
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent page refresh
    e.nativeEvent?.stopImmediatePropagation?.(); // Extra protection against bubbling
    
    // Validate form first
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Login successful - redirect handled by AuthContext
        console.log("Login successful!");
      } else {
        // Handle login failure
        let errorMessage = result.error || "Login failed";
        
        // Set specific field errors based on error type
        if (errorMessage.toLowerCase().includes('email') || 
            errorMessage.toLowerCase().includes('invalid') ||
            errorMessage.toLowerCase().includes('not found')) {
          setFormErrors(prev => ({
            ...prev,
            email: 'No account found with this email address'
          }));
        } else if (errorMessage.toLowerCase().includes('password') || 
                  errorMessage.toLowerCase().includes('invalid email or password') ||
                  errorMessage.toLowerCase().includes('incorrect') || 
                  errorMessage.toLowerCase().includes('wrong')) {
          // Show error on both fields for security reasons (don't reveal which field is wrong)
          setFormErrors(prev => ({
            ...prev,
            email: 'Invalid email or password',
            password: 'Invalid email or password'
          }));
        } else if (errorMessage.toLowerCase().includes('account') && 
                  errorMessage.toLowerCase().includes('inactive')) {
          setFormErrors(prev => ({
            ...prev,
            email: 'Account is inactive. Please contact support.'
          }));
        } else {
          // Generic error
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <h2>Admin Login</h2>
        
        {/* Error display */}
        {error && (
          <div className="admin-error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={formErrors.email ? 'error' : ''}
              disabled={loading}
            />
            {formErrors.email && (
              <div className="admin-field-error">
                <AlertCircle size={14} />
                {formErrors.email}
              </div>
            )}
          </div>
          
          <div className="admin-form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={formErrors.password ? 'error' : ''}
              disabled={loading}
            />
            {formErrors.password && (
              <div className="admin-field-error">
                <AlertCircle size={14} />
                {formErrors.password}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <button 
          className="admin-register-button"
          onClick={() => navigate("/admin/register")}
          disabled={loading}
        >
          Not Registered? Register
        </button>
      </div>
    </div>
  );
}