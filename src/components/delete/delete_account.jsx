// delete_account.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./delete_account.css";
import headerImage from "../login/logo.png";

const DeleteAccount = () => {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    
    const verifyCode = async () => {
        // get data
        setError("");
        const formData = new FormData();
        formData.append("code", code);
        formData.append("csrf_token",document.cookie
          .split("; ")
          .find((row) => row.startsWith("csrf_token="))
          ?.split("=")[1]);
        try {
          const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/verify_delete_code.php", {
            method: "POST",
            credentials:"include",
            body:  formData
          });
    
          const result = await response.json();
    
          if (result.status === "success") {
            setShowModal(true);
          } else {
            setError(result.message);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      };

    const confirmDeletion = async () => {
        const formData = new FormData();
        formData.append("csrf_token",document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrf_token="))
            ?.split("=")[1]);
        const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/confirm_account_deletion.php", {
            method: "POST",
            credentials:'include',
            body: formData
        });
        const data = await response.json();
        if (data.status === "success") {
            console.log(data.message)
            navigate("/");
        } else {
            setError(data.message);
        }
    };

    return (
        <div>
            <div className="header-container">
                    <img src={headerImage} alt="TITLE" />
                </div>
            
            
                <div className="gray-section">
                    <h2>Delete Your Account</h2>
                </div>

            <div className="delete-acc-container">
                <div className="delete-acc-box">
                    <h2>Enter Deletion Code</h2>
                    <input
                        type="text"
                        className="delete-input-field"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter code"
                    />
                    {error && <p className="delete-error-message">{error}</p>}
                    <button className="Deleteaccount-button" onClick={verifyCode}>
                        Delete Account
                    </button>
                </div>

                {showModal && (
                    <div className="delete-modal-overlay">
                        <div className="delete-modal-box">
                            <h3>Are you sure you want to delete your account? This action cannot be undone!</h3>
                            <button className="delete-continue-button" onClick={confirmDeletion}>
                                Yes, Delete My Account
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeleteAccount;