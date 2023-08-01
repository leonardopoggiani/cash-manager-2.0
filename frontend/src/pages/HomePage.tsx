import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface HomePageProps {
  // define any props here, if needed
}

interface Order {
  id: number;
  name: string;
  description: string;
  price: number;
}

const HomePage: React.FC<HomePageProps> = (props) => {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [weeklyIncome, setWeeklyIncome] = useState<number>(0);

  useEffect(() => {
    fetch("http://localhost:5000/api/orders/recent") // update with your actual endpoint
      .then((response) => response.json())
      .then((data) => setRecentOrders(data))
      .catch((error) => console.error("Error fetching recent orders:", error));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/statistics/weekly-income") // update with your actual endpoint
      .then((response) => response.json())
      .then((data) => setWeeklyIncome(data))
      .catch((error) => console.error("Error fetching weekly income:", error));
  }, []);

  return (
    <div>
      <h1 className="text-center text-2xl">Welcome to Cash Manager 2.0</h1>

      <nav>
        <ul>
          <li><Link to="/statistics">Statistics</Link></li>
          <li><Link to="/orders">Orders</Link></li>
          <li><Link to="/warehouse">Warehouse</Link></li>
          <li><Link to="/settings">Settings</Link></li>
          <li><Link to="/logout">Logout</Link></li>
        </ul>
      </nav>

      <h2>Recent Orders</h2>
      <ul>
        {recentOrders.map((order) => (
          <li key={order.id}>
            <h3>{order.name}</h3>
            <p>{order.description}</p>
            <p>Price: {order.price}</p>
          </li>
        ))}
      </ul>

      <h2>Last Week's Income</h2>
      <p>{weeklyIncome}</p>
    </div>
  );
};

export default HomePage;
