import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './sidebar.css';
import logo from '../assets/Cookcraft_Shaded_Logo.png';



const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("Guest");
  const [isOpen, setIsOpen] = useState(false); // State to manage sidebar open/close

  useEffect(() => {
    async function fetchUsername() {
      try {
        const response = await fetch(
          "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_profile.php",
          { credentials: "include" }
        );
        const data = await response.json();
        if (data.success) {
          setUsername(data.username || "Unknown User");
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    }
    fetchUsername();
  }, []);

  function signOut() {
    fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/auth.php", {
      method: "POST"
    });
    document.documentElement.setAttribute("data-theme", "light")
    navigate("/login");
  }

  function toggleSidebar(){
    setIsOpen(!isOpen);
    console.log(isOpen);
  }

  return (
    <>
      {/* Hamburger Menu button */}
      <button className="sidebar-hamburger" onClick={() => toggleSidebar()}>☰</button>

      {/* Sidebar  */}
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        {/* close button */}
        {/* <button className="sidebar-close" onClick={() => setIsOpen(false)}>×</button> */}

        {/* Top Section */}
        <div className="sidebar-top-section">
          <div className="sidebar-logo-container">
            <img 
              src={logo}
              alt="App Logo" 
              className="sidebar-logo"
              onClick={() => navigate('/explore')}
            />
          </div>
          <nav className="sidebar-nav-menu">
            <ul>
              <li className={location.pathname.startsWith('/explore') ? 'active' : ''} onClick={() => navigate('/explore')}>Explore</li>
              <li className={location.pathname.startsWith('/saved-recipes') ? 'active' : ''} onClick={() => navigate('/saved-recipes')}>Saved Recipes</li>
              <li className={location.pathname.startsWith('/trending_recipes') ? 'active' : ''} onClick={() => navigate('/trending_recipes')}>Trending Recipes</li>
              <li className={location.pathname.startsWith('/ingredientSearch') ? 'active' : ''} onClick={() => navigate('/ingredientSearch')}>Ingredient Search</li>
              <li className={location.pathname.startsWith('/planner') ? 'active' : ''} onClick={() => navigate('/planner/view')}>Meal Planner</li>
              <li className={location.pathname.startsWith('/create-recipe') ? 'active' : ''} onClick={() => navigate('/create-recipe')}>Create Recipe</li>
              <li className={location.pathname.startsWith('/profile') ? 'active' : ''} onClick={() => navigate('/profile')}>Profile</li>
            </ul>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="sidebar-bottom-section">
          <ul>
            <li>{username}</li>
            <li onClick={() => navigate('/settings')}>Settings</li>
            <li onClick={signOut}>Sign Out</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
