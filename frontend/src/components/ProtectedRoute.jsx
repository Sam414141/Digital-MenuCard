import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected Route Component
 * Protects routes based on authentication status and user roles
 * 
 * @param {object} children - Child components to render
 * @param {boolean} requireAuth - Whether authentication is required
 * @param {array} allowedRoles - Array of roles allowed to access this route
 * @param {string} redirectPath - Path to redirect to if access is denied
 */
const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  allowedRoles = null, 
  redirectPath = '/login' 
}) => {
  const { isAuthenticated, hasAnyRole } = useAuth();
  const location = useLocation();

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If specific roles are required and user doesn't have any of them
  if (allowedRoles && isAuthenticated && !hasAnyRole(allowedRoles)) {
    // Redirect to appropriate dashboard based on user role
    if (hasAnyRole(['admin'])) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (hasAnyRole(['kitchen_staff'])) {
      return <Navigate to="/staff/kitchen" replace />;
    } else if (hasAnyRole(['waiter'])) {
      return <Navigate to="/staff/waiter-dashboard" replace />;
    } else {
      return <Navigate to="/menu" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;