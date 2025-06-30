import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../services/adminApi';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = auth.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login with the current path to redirect back after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;