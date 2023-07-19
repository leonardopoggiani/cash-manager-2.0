import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
          <ProtectedRoute path="/" isLoggedIn={isLoggedIn}>
            <Route path="/" element={<HomePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/warehouse" element={<WarehousePage />} />
          </ProtectedRoute>
      </Routes>
    </Router>
  );
}

export default App;
