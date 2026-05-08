import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../sidebar/sidebar';
import defaultPFP from '../assets/defaultPFP.jpg';

function Topbar() {
    return (
        <div className="profile-topbar">
            <h1>Edit Profile</h1>
        </div>
    );
}

function EditProfileForm() {
    const navigate = useNavigate();
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
                    }else if(data.message === "not logged in"){
                      console.log("NOTLOGGED")
                      navigate("/login")
                    }else{
                      console.log("Failed")
                      navigate("/login")
                    }
                  };
              
                  checkAuth();
                    
                }, []);
                const [theme, setTheme] = useState('light');
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



    const [image, setImage] = useState(defaultPFP);
    const [selectedFile, setSelectedFile] = useState(null);
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [uploadError, setUploadError] = useState("");
    const [status, setStatus] = useState("");
    const BIO_CHARACTER_LIMIT = 200;

    useEffect(() => {
        async function fetchProfileData() {
            try {
                const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_profile.php", {
                    credentials: "include",
                });
                const data = await response.json();
                if (data.success) {
                    setImage(data.image_url || defaultPFP);
                    setUsername(data.username || "");
                    setBio(data.bio || "");
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        }
        fetchProfileData();
    }, []);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return
      
        const MAX_FILE_SIZE = 1 * 1024 * 1024
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
      
        if (selectedFile.size > MAX_FILE_SIZE) {
          setUploadError("File is too large. Please upload an image smaller than 1MB.")
          return
        }
      
        if (!validTypes.includes(selectedFile.type)) {
          setUploadError("Only JPG, PNG, or WebP image formats are allowed.")
          return
        }
      
        setUploadError("") // Clear any existing error
      
        const formData = new FormData()
        formData.append("profile_picture", selectedFile)
        formData.append(
          "csrf_token",
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrf_token="))
            ?.split("=")[1],
        )
      
        try {
          const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/upload.php", {
            method: "POST",
            body: formData,
            credentials: "include",
          })
      
          const data = await response.json()
          if (data.success) {
            setImage(data.image_url)
          } else {
            setUploadError("Upload failed. Please try again.")
          }
        } catch (error) {
          console.error("Error uploading image:", error)
          setUploadError("An error occurred during upload.")
        }
    };

    const handleSaveChanges = async () => {
        // get data
        const formData = new FormData();
        formData.append("username",username);
        formData.append("bio", bio);
        formData.append("csrf_token",document.cookie
          .split("; ")
          .find((row) => row.startsWith("csrf_token="))
          ?.split("=")[1]);
        try {
          const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/update_profile.php", {
            method: "POST",
            credentials:"include",
            body:  formData
          });
    
          const result = await response.json();
    
          if (result.success) {
            navigate('/profile'); // Redirect to profile page
          } else {
            setStatus("Update failed:"+ result.message);
            console.error("Update failed:", result.message);
          }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
      };
    
    return (
        <div className="profile-info">
            <h2>Edit Profile</h2>
            <div className="profile-picture-container">
                <img src={image} alt="Profile" className="profile-picture" />
            </div>
            <input type="file" onChange={handleFileChange} />
            <div><button onClick={handleUpload} style={{ width: "180px" }}>Upload</button></div>
            {uploadError && <p className="upload-error">{uploadError}</p>}
            <div className="user-details">
                <div className="user-detail">
                    <span>Username:</span>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-field"
                    />
                </div>
                <div className="user-detail bio-section">
                    <span>Bio:</span>
                    <textarea
                        value={bio}
                        onChange={(e) => {
                            if (e.target.value.length <= BIO_CHARACTER_LIMIT) {
                                setBio(e.target.value);
                            }
                        }}
                        className="bio-textarea"
                    />
                    <p>{bio.length}/{BIO_CHARACTER_LIMIT} characters</p>
                    <p className = "error">{status}</p>
                </div>
            </div>
            <div className="profile-actions">
                <button className="btn" onClick={handleSaveChanges}>Save Changes</button>
            </div>
        </div>
    );
}

function EditProfilePage() {
    return (
        <div className="profile-app-container">
            <Sidebar />
            <div className="profile-content-wrapper">
                <Topbar />
                <div className="profile-main-content">
                    <EditProfileForm />
                </div>
            </div>
        </div>
    );
}

export default EditProfilePage;