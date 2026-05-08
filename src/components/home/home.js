import React from "react";
import { Link } from "react-router-dom";
import "./home.css"; 
import logo from "./logo.png"; 
import background from "./background.png";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Home = () => {
  return (
    <div className="home-container">
      
      <div className="home-navbar">
        <img src={logo} alt="Logo" className="home-full-logo" />
        <div className="home-nav-links">
        <Link to="/login" className="home-nav-link">Login</Link>
          <Link to="/register" className="home-nav-link">Signup</Link>
        </div>
      </div>

      
      <div className="home-content">
        <h1>
          The smarter way to <span className="home-highlight">Cook</span>
        </h1>
        <p>Find the recipes and cooking styles that work best for you.</p>
      </div>

    </div>
  );
};

export default Home;

