import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.token !== null);
  if (!isAuthenticated) {
    console.warn('ProtectedRoute: No token found, redirecting to /login');
    return <Navigate to="/login" />;
  }
  return children;
};

export default ProtectedRoute;