import React from 'react';
import Popup from 'reactjs-popup';
import "./login.css";
import logo from '../assets/Cookcraft_Shaded_Logo.png';
import { Link } from "react-router-dom";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

import { useState, useEffect } from "react";
import $ from "jquery";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [result, setResult] = useState("");
  

    let [loggedin, setLogin] = useState(null)
    useEffect(() => {
    async function checkAuth() {
        const response = await fetch(
        "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/auth.php", {
        method: "GET"}
        );
        const data = await response.json();
        setLogin(data.message);
        if(data.message==="logged in"){
        console.log("LOGGED" + data.id)
        navigate("/explore")
        }else if(data.message === "not logged in"){
        console.log("NOTLOGGED")
        }else{
        console.log("Failed")
        }
    };
    checkAuth();  
    }, [result]);

    const handleEmail = (e) => {
        setEmail(e.target.value);
    }
    const handlePass = (e) => {
        setPassword(e.target.value);
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("csrf_token",document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1]);
    try {
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/login.php", {
        method: "POST",
        credentials:"include",
        body:  formData
      });

      const result = await response.json();

      if (result.success) {
        setResult(result.message);
      } else {
        setResult(result.message);
        console.log(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    }

    
  
  return (
    <div className="login-wrapper">
        <div class="login-title">
    <img class="login-logo" src={logo} alt="login-logo"/>
    </div>

    <div class="login-instructions">Sign in with your email and password</div><br></br>
    
    <div class="loginform">
    <form class = "login-innerform"
                action="https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/login.php"
                method="post"
                onSubmit={(event) => handleSubmit(event)}
            >
                <div className = "login-text">Email</div>
                <input
                    type="text"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(event) =>
                        handleEmail(event)
                    }
                    
                />
                 <div className = "login-text">Password</div>
                 <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(event) =>
                        handlePass(event)
                    }
                    
                /><br></br>
      <button type='submit'> Sign in </button>
      <div className="login-status">{result}</div>
    </form>
    <br></br>
    
  <Link to="/reset/request" className = "login-text">Forgot your password?</Link><br></br>
  <Link to="/register" className = "login-text">Create new account</Link><br></br>
</div>
</div>
  );
}

export default Login;