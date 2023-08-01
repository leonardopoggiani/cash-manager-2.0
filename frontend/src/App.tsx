import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import StatisticsPage from './pages/StatisticsPage';
import WarehousePage from './pages/WarehousePage';
import RegisterPage from './pages/RegisterPage';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(Boolean(token));
    console.log("token: " + token)
  }, []);

  // Wait until the auth status has been determined
  if (isLoggedIn === null) {
    return null;
  } else {
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={isLoggedIn ? <HomePage /> : <Navigate to="/login" />} />
      <Route path="/orders" element={isLoggedIn ? <OrdersPage /> : <Navigate to="/login" />} />
      <Route path="/products" element={isLoggedIn ? <ProductsPage /> : <Navigate to="/login" />} />
      <Route path="/statistics" element={isLoggedIn ? <StatisticsPage /> : <Navigate to="/login" />} />
      <Route path="/warehouse" element={isLoggedIn ? <WarehousePage /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to={isLoggedIn ? "/home" : "/login"} />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;

