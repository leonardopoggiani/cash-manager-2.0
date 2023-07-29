import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import StatisticsPage from './pages/StatisticsPage';
import WarehousePage from './pages/WarehousePage';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in when the app loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  console.log("App started")

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
        {isLoggedIn ? (
          <>
            <ProtectedRoute path="/home" isLoggedIn={isLoggedIn} element={<HomePage />} />
            <ProtectedRoute path="/orders" isLoggedIn={isLoggedIn} element={<OrdersPage />} />
            <ProtectedRoute path="/products" isLoggedIn={isLoggedIn} element={<ProductsPage />} />
            <ProtectedRoute path="/statistics" isLoggedIn={isLoggedIn} element={<StatisticsPage />} />
            <ProtectedRoute path="/warehouse" isLoggedIn={isLoggedIn} element={<WarehousePage />} />
          </>
        ) : (
          <Route path="/" element={<Navigate to="/login" />} />
        )}
    </Routes>
  );
}

export default App;
