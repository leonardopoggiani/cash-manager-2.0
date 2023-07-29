import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { CustomProtectedRouteProps } from './components';

const ProtectedRoute: React.FC<CustomProtectedRouteProps> = ({ isLoggedIn }) => {
  return isLoggedIn ? (
    <Route path="/login" element={<LoginPage />} />) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
