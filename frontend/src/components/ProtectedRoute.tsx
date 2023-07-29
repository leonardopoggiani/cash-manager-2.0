import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

interface ProtectedRouteProps {
  path: string;
  isLoggedIn: boolean;
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ path, isLoggedIn, element }) => {
  return isLoggedIn ? (
    <Route path="/login" element={<LoginPage />} /> ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
