import React, { useState } from "react";
import "../style/login.css"; // Import the custom styles
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate from react-router-dom
import cashIcon from '../assets/icon.png'; // replace with the actual path

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Get the history object from react-router-dom

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    var nextPage = ""

    try {
      const data = await response.json();
    
      if (response.ok) {
        // Assuming that the response body has a `token` property
        const token = data.token;
    
        // Save the token to local storage
        localStorage.setItem('token', token);
    
        console.log("token: " + token)
    
        // Login successful
        nextPage = "/home"
      } else {
        // Handle login failure
        console.error("Login failed:", data.error);
        nextPage = "/login"
      }
    } catch (error) {
      // Handle JSON parse error or other unexpected responses
      console.error("Error parsing response:", error);
    }
    
    navigate(nextPage);
    
  };

  return (
    <div className="login-container">
      <h1><img src={cashIcon} alt="Cash Icon" className="cash-icon"/> Cash Manager 2.0</h1>
      <form onSubmit={handleLogin}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <input type="submit" value="Log in" />
      </form>
      <p>
        Not registered? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default LoginPage;
