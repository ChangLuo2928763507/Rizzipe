import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./resetpassword.css";
import headerImage from "../login/logo.png";

function ResetNewPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleResetPassword = async () => {
    // get data
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const formData = new FormData();
    formData.append("email",email);
    formData.append("password",password);
    formData.append("csrf_token",document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1]);
    try {
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/update_password.php", {
        method: "POST",
        credentials:"include",
        body:  formData
      });

      const result = await response.json();

      if (result.status === "success") {
        navigate("/login");
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
          <label>New Password</label>
          <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" />

          <label>Confirm Password</label>
          <input type="password" className="input-field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />

          <button className="ResetPassword-button" onClick={handleResetPassword}>Reset Password</button>
          {message && <p className="error-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default ResetNewPasswordPage;
