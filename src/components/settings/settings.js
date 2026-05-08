import React, { useState, useEffect } from 'react';
import './settings.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../sidebar/sidebar';

function Topbar() {
  return (
    <div className="topbar">
      <h1>Settings</h1>
    </div>
  );
}

function Settings() {
  const [theme, setTheme] = useState('light');
  const [showResetPasswordPopup, setShowResetPasswordPopup] = useState(false);
  const [showChangeEmailPopup, setShowChangeEmailPopup] = useState(false);
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [currentEmail, setCurrentEmail] = useState('');
  const [message, setMessage] = useState(''); // Define setMessage


  const navigate = useNavigate();
  let [loggedin, setLogin] = useState(null);

  const fetchCurrentEmail = async () => {
    try {
      const response = await fetch('https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_current_email.php', {
        method: 'GET',
        credentials: 'include', // Include cookies for session handling
      });
      const data = await response.json();
      if (data.status === 'success' && data.email) {
        setCurrentEmail(data.email);
      } else {
        setMessage(data.message || 'No email found');
      }
    } catch (error) {
      console.error('Error fetching current email:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch(
        "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/auth.php", {
      method: "GET"}
      );
      const data = await response.json();
      setLogin(data.message);
      if(data.message==="logged in"){
        console.log("LOGGED" + data.id);
        fetchCurrentEmail(); // Fetch the current email after confirming the user is logged in
      }else if(data.message === "not logged in"){
        console.log("NOTLOGGED");
        navigate("/login");
      }else{
        console.log("Failed");
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch the user's saved theme preference
  useEffect(() => {
    fetch('https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_theme.php')
      .then((response) => response.json())
      .then((data) => {
        if (data.theme) {
          setTheme(data.theme);
          document.documentElement.setAttribute('data-theme', data.theme);
        }
      })
      .catch((error) => console.error('Error fetching theme:', error));
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    const formData = new FormData();
    formData.append("theme", newTheme);
    formData.append("csrf_token",document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1]);
    try {
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/save_theme.php", {
        method: "POST",
        credentials:"include",
        body:  formData
      });

      const result = await response.json();

      if (result.status !== 'success') {
        console.error('Failed to save theme:'+ result.message);
      } 
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Save the user's theme prefere

  // Handle Reset Password
  const handleResetPassword = () => {
    setShowResetPasswordPopup(true);
  };

  // Handle Change Email
  const handleChangeEmail = () => {
    setShowChangeEmailPopup(true);
  };

  // Added new handler for Delete Account functionality
  const handleDeleteAccount = async () => {
    // get data
    const formData = new FormData();
    formData.append("csrf_token",document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1]);
    try {
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/send_delete_code.php", {
        method: "POST",
        credentials:"include",
        body:  formData
      });

      const result = await response.json();

      if (result.status === "success") {
        navigate('/delete_account');
      } else {
        setMessage(result.message || 'Failed to send verification code.');
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  const toggleProfileVisibility = async () => {
    // get data
    const newVisibility = !isProfilePublic;
    setIsProfilePublic(newVisibility);
    // Send the new visibility preference to the backend
    const formData = new FormData();
    formData.append("isPublic", newVisibility);
    formData.append("csrf_token",document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1]);
    try {
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/save_profile_visibility.php", {
        method: "POST",
        credentials:"include",
        body:  formData
      });

      const result = await response.json();

      if (result.status !== 'success') {
        console.error('Failed to update profile visibility:', result.message);
      } 
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Close Pop-ups
  const closePopups = () => {
    setShowResetPasswordPopup(false);
    setShowChangeEmailPopup(false);
  };

  return (
    <div className="settings-app-container">
      <Sidebar />
      <div className="content-wrapper">
        <Topbar />
        <div className="main-content">
          <div className="section">
            <h2>Appearance</h2>
            <div className="theme-toggle">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                />
                <span className="slider"></span>
              </label>
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
          </div>

          <div className="section">
            <h2>Account Settings</h2>
            <button className="settings-button" onClick={handleResetPassword}>
              Reset Password
            </button>
            <button className="settings-button" onClick={handleChangeEmail}>
              Change Email
            </button>
            <button className="settings-button" onClick={handleDeleteAccount}>
              Delete Account
            </button>
            <div className="current-email">
              {currentEmail ? `Current Email: ${currentEmail}` : 'No email found'}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Pop-up */}
      {showResetPasswordPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Reset Password</h3>
            <p>Are you sure you want to reset your password?</p>
            <div className="popup-buttons">
              <button
                className="popup-button confirm"
                onClick={() => {
                  // Redirect to reset password page
                  navigate("/reset/request");
                }}
              >
                Yes
              </button>
              <button className="popup-button cancel" onClick={closePopups}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Email Pop-up */}
      {showChangeEmailPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Change Email</h3>
            <p>Are you sure you want to change your email?</p>
            <div className="popup-buttons">
              <button
                className="popup-button confirm"
                onClick={() => {
                  // Redirect to change email page
                  navigate("/change/request");
                }}
              >
                Yes
              </button>
              <button className="popup-button cancel" onClick={closePopups}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;  