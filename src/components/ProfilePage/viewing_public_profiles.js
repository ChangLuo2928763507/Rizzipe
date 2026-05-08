"use client"

import { useState, useEffect } from "react"
import "./ProfilePage.css"
import { useNavigate, useParams } from "react-router-dom" // useParams for dynamic user profile
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

function PublicProfileInfo() {
  const navigate = useNavigate()
  const { user_id } = useParams() // Get the user_id from the URL
  const [theme, setTheme] = useState("light")
  const [image, setImage] = useState(defaultPFP)
  const [bio, setBio] = useState("")
  const [username, setUsername] = useState("")
  const [joinedDate, setJoinedDate] = useState("")
  const [recipes, setRecipes] = useState([])
  const [achievements, setAchievements] = useState([])

  // Theme management
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

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await fetch(
          `https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_profile.php?user_id=${user_id}`,
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
  }, [user_id]) // Fetch profile data based on user_id

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await fetch(
          `https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_user_recipes.php?user_id=${user_id}`,
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
  }, [user_id]) // Fetch profile data based on user_id

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const response = await fetch(
          `https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_achievements.php?user_id=${user_id}`,
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
  }, [user_id])
  function handleRecipeClick(value) {
    navigate(`/recipe/${value}`)
  }

  return (
    <div className="profile-info">
      <h2>{username}'s Profile</h2>

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

      <div className="user-achievements">
        <h3>Achievements</h3>
        <ul className="achievement-list">
          <li className={achievements.added_bio ? "achieved" : "not-achieved"}>
            <div className="achievement-content">
              <span className="emoji">📝</span>
              <p>Added a Bio</p>
            </div>
          </li>
          <li className={achievements.created_first_recipe ? "achieved" : "not-achieved"}>
            <div className="achievement-content">
              <span className="emoji">🍽️</span>
              <p>Created First Recipe</p>
            </div>
          </li>
          <li className={achievements.created_10_recipes ? "achieved" : "not-achieved"}>
            <div className="achievement-content">
              <span className="emoji">👨‍🍳</span>
              <p>Created 10 Recipes</p>
            </div>
          </li>
          <li className={achievements.left_review ? "achieved" : "not-achieved"}>
            <div className="achievement-content">
              <span className="emoji">⭐</span>
              <p>Left a Review</p>
            </div>
          </li>
          <li className={achievements.left_10_reviews ? "achieved" : "not-achieved"}>
            <div className="achievement-content">
              <span className="emoji">🌟</span>
              <p>Left 10 Reviews</p>
            </div>
          </li>
        </ul>
      </div>

      {/* User Recipes Section */}
      <div className="user-recipes">
        <h3>User's Recipes</h3>
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
          <p>User hasn't posted any recipes yet.</p>
        )}
      </div>
    </div>
  )
}

function PublicProfilePage() {
  return (
    <div className="profile-app-container">
      <Sidebar />
      <div className="profile-content-wrapper">
        <Topbar />
        <div className="profile-main-content">
          <PublicProfileInfo />
        </div>
      </div>
    </div>
  )
}

export default PublicProfilePage
