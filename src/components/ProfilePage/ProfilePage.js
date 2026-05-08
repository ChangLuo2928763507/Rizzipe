"use client"

import { useState, useEffect } from "react"
import "./ProfilePage.css"
import { useNavigate } from "react-router-dom"
import Sidebar from "../sidebar/sidebar"
import defaultPFP from '../assets/defaultPFP.jpg';


function formatDate(dateString) {
  if (!dateString) return "Unknown Date";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Topbar() {
  return (
    <div className="profile-topbar">
      <h1>Profile</h1>
    </div>
  )
}

function ProfileInfo() {
  const navigate = useNavigate()
  const [loggedin, setLogin] = useState(null)
  useEffect(() => {
    async function checkAuth() {
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/auth.php", {
        method: "GET",
        credentials: "include",
      })
      const data = await response.json()
      setLogin(data.message)
      if (data.message === "logged in") {
        console.log("LOGGED" + data.id)
      } else if (data.message === "not logged in") {
        console.log("NOTLOGGED")
        navigate("/login")
      } else {
        console.log("Failed")
        navigate("/login")
      }
    }

    checkAuth()
  }, [])
  const [theme, setTheme] = useState("light")
  useEffect(() => {
    fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_theme.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.theme) {
          setTheme(data.theme)
          document.documentElement.setAttribute("data-theme", data.theme)
        }
      })
      .catch((error) => console.error("Error fetching theme:", error))
  }, [])

  const [image, setImage] = useState(defaultPFP)
  const [selectedFile, setSelectedFile] = useState(null)
  const [bio, setBio] = useState("")
  const [username, setUsername] = useState("")
  const [joinedDate, setJoinedDate] = useState("")
  const [recipes, setRecipes] = useState([])
  const [achievements, setAchievements] = useState({})
  const [uploadError, setUploadError] = useState("")

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await fetch(
          "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_profile.php",
          { credentials: "include" },
        )
        const data = await response.json()
        if (data.success) {
          setUsername(data.username || "Unknown Username")
          setImage(data.image_url || defaultPFP)
          setBio(data.bio || "No Bio")
          setJoinedDate(data.joined_date || "Unknown Date")
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
      }
    }
    fetchProfileData()
  }, [])

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await fetch(
          "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_user_recipes.php",
          {
            credentials: "include",
          },
        )
        const data = await response.json()
        if (data.success) {
          setRecipes(data.recipes)
        } else {
          console.error("Failed to fetch recipes:", data.message)
        }
      } catch (error) {
        console.error("Error fetching recipes:", error)
      }
    }

    fetchRecipes()
  }, [])

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const response = await fetch(
          "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_achievements.php",
          { credentials: "include" },
        )
        const data = await response.json()
        if (data.success) {
          setAchievements(data.achievements)
        } else {
          console.error("Failed to fetch achievements:", data.message)
        }
      } catch (error) {
        console.error("Error fetching achievements:", error)
      }
    }

    fetchAchievements()
  }, [])

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0])
  }

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
  }

  function handleRecipeClick(value) {
    navigate(`/recipe/${value}`)
  }

  return (
    <div className="profile-info">
      <h2>My Profile</h2>

      {/* Profile Picture */}
      <div className="profile-picture-container">
        <img src={image || defaultPFP} alt="Profile" className="profile-picture" />
      </div>


      <div className="user-details">
        <div className="user-detail">
          <span>Username:</span>
          <p>{username}</p>
        </div>
        <div className="user-detail">
          <span>Joined:</span>
          <p>{formatDate(joinedDate)}</p>
        </div>
        <div className="user-detail bio-section">
          <span>Bio:</span>
          <p>{bio}</p>
        </div>
      </div>

      <div className="profile-actions">
        <button className="btn" onClick={() => navigate("/edit-profile")}>
          Edit Profile
        </button>
        <button className="btn" onClick={() => navigate("/create-recipe")}>
          Create a Recipe
        </button>
      </div>

      <div className="user-achievements">
        <h3>Achievements</h3>
        <ul className="achievement-list">
          <li className={achievements.added_bio ? "achieved" : "not-achieved"}>
            <div className="achievement-content">
              <span className="emoji">ðŸ“</span>
              <p>Added a Bio</p>
            </div>
          </li>
          <li className={achievements.created_first_recipe ? "achieved" : "not-achieved"}>
            <div className="achievement-content">
              <span className="emoji">ðŸ½ï¸</span>
              <p>Created First Recipe</p>
            </div>
          </li>
          <li className={achievements.created_10_recipes ? "achieved" : "not-achieved"}>
            <div className="achievement-content">
              <span className="emoji">ðŸ‘¨â€ðŸ³</span>
              <p>Created 10 Recipes</p>
            </div>
          </li>
          <li className={achievements.left_review ? "achieved" : "not-achieved"}>
            <div className="achievement-content">
              <span className="emoji">â­</span>
              <p>Left a Review</p>
            </div>
          </li>
          <li className={achievements.left_10_reviews ? "achieved" : "not-achieved"}>
            <div className="achievement-content">
              <span className="emoji">ðŸŒŸ</span>
              <p>Left 10 Reviews</p>
            </div>
          </li>
        </ul>
      </div>

      {/* User Recipes Section */}
      <div className="user-recipes">
        <h3>Your Recipes</h3>
        {recipes.length > 0 ? (
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="recipe-card">
                <img src={recipe.image || "/placeholder.svg"} alt={recipe.name} className="recipe-image" />
                <div className="recipe-content">
                  <h3 className="recipe-title">{recipe.name}</h3>
                  <p className="recipe-description">{recipe.steps}</p>
                  <div className="recipe-meta">
                    <p>Rating: {recipe.rating}</p>
                    <p>Difficulty: {recipe.diff}</p>
                  </div>
                  <button onClick={() => handleRecipeClick(recipe.id)} className="recipe-button">
                    View Recipe
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You haven't posted any recipes yet.</p>
        )}
      </div>
    </div>
  )
}

function ProfilePage() {
  return (
    <div className="profile-app-container">
      <Sidebar />
      <div className="profile-content-wrapper">
        <Topbar />
        <div className="profile-main-content">
          <ProfileInfo />
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
