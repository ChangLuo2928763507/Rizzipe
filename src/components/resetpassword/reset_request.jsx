import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./resetpassword.css";
import headerImage from "../login/logo.png";

function ResetRequestPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRequestReset = async () => {
    // get data
    const formData = new FormData();
    formData.append("email",email)
    formData.append("csrf_token",document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1]);
    try {
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/send_reset_code.php", {
        method: "POST",
        credentials:"include",
        body:  formData
      });

      const result = await response.json();

      if (result.status === "success") {
        navigate("/reset/code", { state: { email } })
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
        <h2>Reset Your Password</h2>
      </div>

      <div className="reset-container">
        <div className="reset-box">
          <label>Email</label>
          <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
          <button className="ResetPassword-button" onClick={handleRequestReset}>Send Code</button>
          {message && <p className="error-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default ResetRequestPage;
