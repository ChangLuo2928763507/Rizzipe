"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import styles from "./explore_page.module.css"

const images = require.context("../assets", false, /\.(jpg|jpeg|png)$/)

function MealPage() {
  const { mealType } = useParams() // get type like breakfast
  const navigate = useNavigate()
  const [meals, setMeals] = useState([])
  // Add state for dietary restriction
  const [dietaryRestriction, setDietaryRestriction] = useState("none")

  useEffect(() => {
    async function fetchMeals() {
      try {
        // Add dietary restriction parameter to the URL
        const url = `https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_recipes_by_category.php?category=${mealType.toLowerCase()}&dietary=${dietaryRestriction}`
        const response = await fetch(url)
        const data = await response.json()
        setMeals(data)
      } catch (error) {
        console.error("Error fetching meals:", error)
      }
    }
    fetchMeals()
  }, [mealType, dietaryRestriction]) // Add dietaryRestriction to dependency array

  // Handler for dietary restriction changes
  const handleDietaryChange = (e) => {
    setDietaryRestriction(e.target.value)
  }

  function handleRecipeClick(value) {
    navigate(`/recipe/${value}`)
  }

  return (
    <div className={styles["main-content"]}>
      <div className={styles["meal-header"]}>
        <h1>Showing results for "{mealType.charAt(0).toUpperCase() + mealType.slice(1)}"</h1>
        {/* Add dietary restriction dropdown */}
        <select className={styles["dietary-dropdown"]} value={dietaryRestriction} onChange={handleDietaryChange}>
          <option value="none">No Dietary Restriction</option>
          <option value="keto">Keto</option>
          <option value="vegan">Vegan</option>
          <option value="vegetarian">Vegetarian</option>
        </select>
      </div>
      {/* Updated to use recipe-grid class for consistency */}
      <div className={styles["recipe-grid"]}>
        {meals.length === 0 ? (
          <p>No recipes found in this category.</p>
        ) : (
          meals.map((meal, index) => (
            <div key={index} className={styles["recipe-card"]}>
              <img
                src={meal.image.startsWith("http") ? meal.image : images(`./${meal.image}`)}
                alt={meal.name}
                className={styles["recipe-image"]}
              />
              <div className={styles["recipe-content"]}>
                <h3 className={styles["recipe-title"]}>{meal.name}</h3>
                <p className={styles["recipe-description"]}>{meal.steps}</p>
                <div className={styles["recipe-meta"]}>
                  <p>Rating: {meal.rating}</p>
                  <p>Difficulty: {meal.diff}</p>
                </div>
                <button onClick={() => handleRecipeClick(meal.id)} className={styles["recipe-button"]}>
                  View Recipe
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MealPage
