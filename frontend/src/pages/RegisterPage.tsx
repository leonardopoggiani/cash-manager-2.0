import React, { useState } from "react";
import { Link } from "react-router-dom";
import cashIcon from '../assets/icon.png'; // replace with the actual path
import "../style/register.css"; // Import the custom styles

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    const response = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        name,
        surname,
      }),
    });

    const data = await response.json();

    console.log(data)

    if (response.ok) {
      setIsRegistered(true); // Set the registered state to true
    } else {
      setErrorMessage(data.message); // Set the error message from the response
    }
  };

  return (
    <div className="register-container">
      <h1><img src={cashIcon} alt="Cash Icon" className="cash-icon" /> Cash Manager 2.0</h1>
      <form onSubmit={handleRegister}>
        {isRegistered ? ( // If registered, show success message
          <div>
            <p>Registration successful! You can now <Link to="/login">log in</Link>.</p>
          </div>
        ) : (
          // If not registered, show the registration form
          <>
            {errorMessage && <p>{errorMessage}</p>}
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Surname:
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
            </label>
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
            <input type="submit" value="Register" />
          </>
        )}
      </form>
    </div>
  );
};

export default RegisterPage;
