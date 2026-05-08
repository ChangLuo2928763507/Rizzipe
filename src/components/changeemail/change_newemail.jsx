import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./changeemail.css";
import headerImage from "../login/logo.png";

function ChangeNewEmailPage() {
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const oldEmail = location.state?.email || "";

  const handleChangeEmail = async () => {
    // get data
    if (newEmail !== confirmEmail) {
      setMessage("Emails do not match.");
      return;
    }
    const formData = new FormData();
    formData.append("oldEmail", oldEmail);
    formData.append("newEmail", newEmail);
    formData.append("csrf_token",document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1]);
    try {
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/update_email.php", {
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
        <h2>Change Your Email</h2>
      </div>

      <div className="change-container">
        <div className="change-box">
          <label>New Email</label>
          <input type="email" className="input-field" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Enter new email" />

          <label>Confirm Email</label>
          <input type="email" className="input-field" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} placeholder="Confirm new email" />

          <button className="ChangeEmail-button" onClick={handleChangeEmail}>Change Email</button>
          {message && <p className="error-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default ChangeNewEmailPage;