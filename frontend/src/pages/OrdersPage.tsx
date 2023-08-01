import React, { useState, useEffect } from "react";
import '../style/orders.css';  // Import the CSS

interface Order {
  id: number;
  name: string;
  description: string;
  price: number;
}

const OrdersPage = () => {

  console.log("Orders page!")
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/orders")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setOrders(data);
      })
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);
  
  if (orders.length === 0) {
    return <h2>No orders found</h2>;
  }

  return (
    <div className="orders-container">
      <h1 className="orders-title">Your Orders</h1>
      <ul className="orders-list">
        {orders.map((order) => (
          <li key={order.id} className="order-item">
            <h2 className="order-name">{order.name}</h2>
            <p className="order-description">{order.description}</p>
            <p className="order-price">Price: {order.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersPage;
