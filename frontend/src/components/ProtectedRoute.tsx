import React from 'react';
import { Route, Navigate, Outlet, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  isLoggedIn: boolean;
  path: string;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isLoggedIn, ...rest }) => {
  const location = useLocation();

  return (
    <Route {...rest}>
      {isLoggedIn ? children : <Navigate to="/login" state={{ from: location }} replace />}
    </Route>
  );
};

export default ProtectedRoute;
