import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService"; // Use apiService instead of axios
import "../styles/AdminRegister.css";

export default function AdminRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const register = () => {
    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // For admin registration, we'll use the first part of the name as firstName
    // and "Admin" as lastName to satisfy the validation requirements
    const firstName = name.trim();
    const lastName = "Admin";

    // Using the standard register endpoint through apiService
    apiService.register({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    })
    .then((response) => {
      if (response.status === "success") {
        alert("Registration successful! Please login.");
        navigate("/admin/login"); // Redirect to admin login page
      } else {
        alert(response.message || "Registration failed.");
      }
    })
    .catch((error) => {
      console.error("Registration error:", error);
      alert("An error occurred during registration. Please try again.");
    });
  };

  return (
    <div className="admin-register">
      <h2>Admin Register</h2>
      <input
        type="text"
        placeholder="Admin Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Admin Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password (min 8 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={register}>Register</button>
      <button onClick={() => navigate("/admin/login")}>Already Registered? Login</button> {/* Navigate to login page */}
    </div>
  );
}