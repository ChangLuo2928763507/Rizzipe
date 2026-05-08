import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "./RegisterPage.css";
import headerImage from '../assets/Cookcraft_Shaded_Logo.png';
import { Link } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState("");
  

  useEffect(() => {
                    async function checkAuth() {
                      const response = await fetch(
                        "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/auth.php", {
                      method: "GET"}
                      );
                    };
                    checkAuth();
                  }, []);

  // connect API
  const handleSignIn = async () => {
    // get data
    const username = document.querySelector("input[name='username']").value;
    const email = document.querySelector("input[name='email']").value;
    const password = document.querySelector("input[name='password']").value;

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("csrf_token",document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1]);
    try {
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/register.php", {
        method: "POST",
        credentials:"include",
        body: formData,
      });

      const result = await response.json();

      if (result.status === "success") {
        navigate("/explore")
      } else {
        setResult(result.message)
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      
      <div className="register-navbar">
        <img src={headerImage} alt="Header" className="register-logo" />
      </div>

      {}
      <div className="register-instructions">
        Create an account with a new username and email
      </div>


      {}
      <div className="register-container">
        <div className="register-box">
          <label>Username</label>
          <input type="text" name="username" className="input-field" placeholder="Enter your username" />

          <label>Email</label>
          <input type="email" name="email" className="input-field" placeholder="Enter your email" />

          <label>Password</label>
          <input type="password" name="password" className="input-field" placeholder="Enter your password" />
          <ul className="password-requirements">
            <li>At least one uppercase letter</li>
            <li>At least one lowercase letter</li>
            <li>At least one numeral (0–9)</li>
            <li>At least one symbol (!@#^*_?{}-)</li>
            <li>At least 8 characters</li>
            <li>Don’t use your email or name</li>
          </ul>

          <div className="register-status">{result}</div>
          <button className="CreateAccount-button" onClick={handleSignIn}>Create Account</button>

          <div className="extra-links">
          <Link to="/login">Already have an account?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
