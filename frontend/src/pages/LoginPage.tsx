import React, { useState } from "react";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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

    const data = await response.json();
    
    if (response.ok) {
      // Login successful
      // You can store the received token in localstorage or context or however you manage state in your app
    } else {
      // Handle login failure
      // You might want to set an error message in your component's state and display it to the user
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <label>
        Username:
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
      </label>
      <label>
        Password:
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </label>
      <input type="submit" value="Log in" />
    </form>
  );
};

export default LoginPage;
