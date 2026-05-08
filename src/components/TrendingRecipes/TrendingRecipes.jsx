"use client"

import { useState, useEffect } from "react"
import "./TrendingRecipes.css"
import { useNavigate } from "react-router-dom"
import Sidebar from "../sidebar/sidebar"

function Topbar() {
  return (
    <div className="trending-recipes-topbar">
      <h1>Trending Recipes</h1>
    </div>
  )
}

function TrendingRecipes() {
  const navigate = useNavigate()
  const [trendingRecipes, setTrendingRecipes] = useState([])
  const [theme, setTheme] = useState("light")
  // Add state for dietary restriction
  const [dietaryRestriction, setDietaryRestriction] = useState("none")

  useEffect(() => {
    // Fetch theme preference
    fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_theme.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.theme) {
          setTheme(data.theme)
          document.documentElement.setAttribute("data-theme", data.theme)
        }
      })

    // Fetch trending recipes
    async function fetchTrendingRecipes() {
      try {
        // Add dietary restriction parameter to the URL
        const url = `https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_trending_recipes.php${dietaryRestriction !== "none" ? `?dietary=${dietaryRestriction}` : ""}`
        const response = await fetch(url, {
          credentials: "include",
        })
        const data = await response.json()
        if (data.success) {
          setTrendingRecipes(data.recipes)
        } else {
          console.error("Failed to fetch trending recipes:", data.message)
        }
      } catch (error) {
        console.error("Error fetching trending recipes:", error)
      }
    }
    fetchTrendingRecipes()
  }, [dietaryRestriction]) // Add dietaryRestriction to dependency array

  // Handler for dietary restriction changes
  const handleDietaryChange = (e) => {
    setDietaryRestriction(e.target.value)
  }

  function handleRecipeClick(value) {
    navigate(`/recipe/${value}`)
  }

  return (
    <div className="trending-recipes">
      <div className="trending-header">
        <h3 className="trending-title">Popular Right Now</h3>
        {/* Add dietary restriction dropdown */}
        <select className="dietary-dropdown" value={dietaryRestriction} onChange={handleDietaryChange}>
          <option value="none">No Dietary Restriction</option>
          <option value="keto">Keto</option>
          <option value="vegan">Vegan</option>
          <option value="vegetarian">Vegetarian</option>
        </select>
      </div>
      {trendingRecipes.length > 0 ? (
        <div className="recipe-grid">
          {trendingRecipes.map((recipe) => (
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
        <p className="no-recipes-message">No trending recipes available.</p>
      )}
    </div>
  )
}

function TrendingRecipesPage() {
  return (
    <div className="profile-app-container">
      <Sidebar />
      <div className="profile-content-wrapper">
        <Topbar />
        <div className="profile-main-content">
          <TrendingRecipes />
        </div>
      </div>
    </div>
  )
}

export default TrendingRecipesPage

