import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./resetpassword.css";
import headerImage from "../login/logo.png";

function ResetCodePage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || ""; // Get email passed from previous page

  const handleVerifyCode = async () => {
    const formData = new FormData();
    formData.append("email",email);
    formData.append("code",code);
    formData.append("csrf_token",document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1]);
    try {
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/verify_reset_code.php", {
        method: "POST",
        credentials:"include",
        body:  formData
      });

      const result = await response.json();

      if (result.status === "success") {
        navigate("/reset/newpassword", { state: { email } });
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
          <label>Confirmation Code</label>
          <input type="text" className="input-field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter the code sent to your email" />
          <button className="ResetPassword-button" onClick={handleVerifyCode}>Verify Code</button>
          {message && <p className="error-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default ResetCodePage;
