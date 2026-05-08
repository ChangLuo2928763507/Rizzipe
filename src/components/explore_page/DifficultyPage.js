"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./explore_page.module.css"

// 动态导入 `src/assets/` 里的所有图片
const images = require.context("../assets", false, /\.(jpg|jpeg|png)$/)

// 难度级别映射
const difficultyLevels = [
  { value: 1, label: "Easy" },
  { value: 2, label: "Intermediate" },
  { value: 3, label: "Hard" },
  { value: 4, label: "Very Hard" },
  { value: 5, label: "Expert" },
]

function DifficultyPage() {
  const navigate = useNavigate()
  const [difficulty, setDifficulty] = useState(1)
  const [recipes, setRecipes] = useState([])
  // Add state for dietary restriction
  const [dietaryRestriction, setDietaryRestriction] = useState("none")

  useEffect(() => {
    async function fetchRecipes() {
      try {
        // Add dietary restriction parameter to the URL
        const url = `https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_recipes_by_diff.php?diff=${difficulty}&dietary=${dietaryRestriction}`
        const response = await fetch(url)
        const data = await response.json()
        setRecipes(data)
      } catch (error) {
        console.error("Error fetching recipes:", error)
      }
    }
    fetchRecipes()
  }, [difficulty, dietaryRestriction]) // Add dietaryRestriction to dependency array

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
        <h1>Recipes for Difficulty: {difficultyLevels.find((d) => d.value === difficulty)?.label}</h1>
        <div className={styles["filter-container"]}>
          {/* Add dietary restriction dropdown */}
          <select className={styles["dietary-dropdown"]} value={dietaryRestriction} onChange={handleDietaryChange}>
            <option value="none">No Dietary Restriction</option>
            <option value="keto">Keto</option>
            <option value="vegan">Vegan</option>
            <option value="vegetarian">Vegetarian</option>
          </select>
          <select
            className={styles["difficulty-select"]}
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
          >
            {difficultyLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Updated to use recipe-grid class for consistency */}
      <div className={styles["recipe-grid"]}>
        {recipes.length === 0 ? (
          <p>No recipes found for this level.</p>
        ) : (
          recipes.map((recipe, index) => (
            <div key={index} className={styles["recipe-card"]}>
              <img
                src={recipe.image.startsWith("http") ? recipe.image : images(`./${recipe.image}`)}
                alt={recipe.name}
                className={styles["recipe-image"]}
              />
              <div className={styles["recipe-content"]}>
                <h3 className={styles["recipe-title"]}>{recipe.name}</h3>
                <p className={styles["recipe-description"]}>{recipe.steps}</p>
                <div className={styles["recipe-meta"]}>
                  <p>Rating: {recipe.rating}</p>
                  <p>Difficulty: {recipe.diff}</p>
                </div>
                <button onClick={() => handleRecipeClick(recipe.id)} className={styles["recipe-button"]}>
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

export default DifficultyPage
