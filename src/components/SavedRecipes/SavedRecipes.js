"use client"

import { useState, useEffect } from "react"
import "./SavedRecipes.css"
import { useNavigate } from "react-router-dom"
import Sidebar from "../sidebar/sidebar"

function Topbar() {
  return (
    <div className="saved-recipes-topbar">
      <h1>Saved Recipes</h1>
    </div>
  )
}

function SavedRecipes() {
  const navigate = useNavigate()
  const [savedRecipes, setSavedRecipes] = useState([])

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

  useEffect(() => {
    async function fetchSavedRecipes() {
      try {
        const response = await fetch(
          "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_saved_recipes.php",
          {
            credentials: "include",
          },
        )
        const data = await response.json()
        if (data.success) {
          setSavedRecipes(data.recipes)
        } else {
          console.error("Failed to fetch saved recipes:", data.message)
        }
      } catch (error) {
        console.error("Error fetching saved recipes:", error)
      }
    }
    fetchSavedRecipes()
  }, [])

  function handleRecipeClick(value) {
    navigate(`/recipe/${value}`)
  }

  return (
    <div className="saved-recipes">
      <h3>Your Saved Recipes</h3>
      {savedRecipes.length > 0 ? (
        <div className="recipe-grid">
          {savedRecipes.map((recipe) => (
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
        <p>You haven't saved any recipes yet.</p>
      )}
    </div>
  )
}

function SavedRecipesPage() {
  return (
    <div className="profile-app-container">
      <Sidebar />
      <div className="profile-content-wrapper">
        <Topbar />
        <div className="profile-main-content">
          <SavedRecipes />
        </div>
      </div>
    </div>
  )
}

export default SavedRecipesPage
