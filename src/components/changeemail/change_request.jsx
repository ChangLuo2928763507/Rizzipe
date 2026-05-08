import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./changeemail.css";
import headerImage from "../login/logo.png";

function ChangeRequestPage() {
  const [email, setEmail] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fetch the logged-in user's email on component mount
  useEffect(() => {
    const fetchLoggedInEmail = async () => {
      try {
        const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_current_email.php", {
          method: "GET",
          credentials: "include", // Include cookies for session handling
        });
        const data = await response.json();
        if (data.status === "success" && data.email) {
          setLoggedInEmail(data.email); // Set the logged-in user's email
        } else {
          setMessage("Failed to fetch your current email. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching logged-in email:", error);
        setMessage("An error occurred. Please try again.");
      }
    };

    fetchLoggedInEmail();
  }, []);

  const handleRequestChange = async () => {
    // get data
    if (email !== loggedInEmail) {
      setMessage("The entered email does not match your current email.");
      return;
    }
    const formData = new FormData();
    formData.append("email", email);
    formData.append("csrf_token",document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1]);
    try {
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/send_change_code.php", {
        method: "POST",
        credentials:"include",
        body:  formData
      });

      const result = await response.json();

      if (result.status === "success") {
        navigate("/change/code", { state: { email } });
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <div className="header-container">
        <img src={headerImage} alt="TITLE" />
      </div>

      <div className="gray-section">
        <h2>Change Your Email</h2>
      </div>

      <div className="change-container">
        <div className="change-box">
          <label>Current Email</label>
          <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your current email"
          />
          <button className="ChangeEmail-button" onClick={handleRequestChange}>
            Send Code
          </button>
          {message && <p className="error-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default ChangeRequestPage;