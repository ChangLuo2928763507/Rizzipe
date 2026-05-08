"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./CreateRecipe.css"

function CreateRecipe() {
  const navigate = useNavigate()
  const [recipeName, setRecipeName] = useState("")
  const [ingredients, setIngredients] = useState("")
  const [quantities, setQuantities] = useState("")
  const [instructions, setInstructions] = useState("")
  const [difficulty, setDifficulty] = useState(1)
  const [selectedFile, setSelectedFile] = useState(null)
  const [category, setCategory] = useState("")
  // Add dietary restriction state
  const [dietaryRestriction, setDietaryRestriction] = useState(null)
  // Optional nutritional fields
  const [calories, setCalories] = useState("")
  const [totalFat, setTotalFat] = useState("")
  const [cholesterol, setCholesterol] = useState("")
  const [totalCarbohydrates, setTotalCarbohydrates] = useState("")
  const [sugars, setSugars] = useState("")
  const [protein, setProtein] = useState("")

  const RECIPE_NAME_LIMIT = 50
  const INGREDIENTS_LIMIT = 500
  const QUANTITIES_LIMIT = 500
  const INSTRUCTIONS_LIMIT = 2000
  const NUTRITION_CHAR_LIMIT = 20

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0])
  }

  const handleSubmit = async () => {
    if (!recipeName || !ingredients || !quantities || !instructions || !selectedFile) {
      alert("Please fill in all required fields and select an image.")
      return
    }

    const ingredientList = ingredients.split(",").map((i) => i.trim())
    const quantityList = quantities.split(",").map((q) => q.trim())

    if (ingredientList.length !== quantityList.length) {
      alert("Error: Number of ingredients must match number of quantities.")
      return
    }

    const formData = new FormData()
    formData.append("recipe_name", recipeName)
    formData.append("ingredients", ingredients)
    formData.append("quantities", quantities)
    formData.append("instructions", instructions)
    formData.append("difficulty", difficulty)
    formData.append("category", category)
    formData.append("recipe_image", selectedFile)
    
    if (dietaryRestriction) {
      formData.append("dietary_restriction", dietaryRestriction)
    }
    formData.append(
      "csrf_token",
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf_token="))
        ?.split("=")[1],
    )


    formData.append(
      "csrf_token",
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf_token="))
        ?.split("=")[1],
    )
    // Append nutritional values if provided and within limit
    if (calories !== "" && calories.length <= NUTRITION_CHAR_LIMIT) formData.append("calories", calories)
    if (totalFat !== "" && totalFat.length <= NUTRITION_CHAR_LIMIT) formData.append("total_fat", totalFat)
    if (cholesterol !== "" && cholesterol.length <= NUTRITION_CHAR_LIMIT) formData.append("cholesterol", cholesterol)
    if (totalCarbohydrates !== "" && totalCarbohydrates.length <= NUTRITION_CHAR_LIMIT)
      formData.append("total_carbohydrates", totalCarbohydrates)
    if (sugars !== "" && sugars.length <= NUTRITION_CHAR_LIMIT) formData.append("sugars", sugars)
    if (protein !== "" && protein.length <= NUTRITION_CHAR_LIMIT) formData.append("protein", protein)

    try {
      const response = await fetch(
        "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/create_recipe.php",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        },
      )
      const data = await response.json()
      if (data.success) {
        alert("Recipe Created Successfully!")
        navigate("/profile")
      } else {
        alert("Error: " + data.message)
      }
    } catch (error) {
      console.error("Error creating recipe:", error)
    }
  }

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

  // Handler for the back button
  const handleGoBack = () => {
    navigate(-1) // This navigates to the previous page in history
  }

  return (
    <div className="create-recipe-app-container">
      <div className="create-recipe-container">
        <div className="header-with-back">
          <button className="back-button" onClick={handleGoBack}>
            ← Back
          </button>
          <h2>Create a Recipe</h2>
        </div>

        <input
          type="text"
          placeholder="Recipe Name"
          value={recipeName}
          onChange={(e) => {
            if (e.target.value.length <= RECIPE_NAME_LIMIT) {
              setRecipeName(e.target.value)
            }
          }}
        />
        <p className="char-count">
          {recipeName.length}/{RECIPE_NAME_LIMIT} characters
        </p>
        <textarea
          placeholder="Ingredients (Separate by commas)"
          value={ingredients}
          onChange={(e) => {
            if (e.target.value.length <= INGREDIENTS_LIMIT) {
              setIngredients(e.target.value)
            }
          }}
        />
        <p className="char-count">
          {ingredients.length}/{INGREDIENTS_LIMIT} characters
        </p>
        <textarea
          placeholder="Quantities (Separate by commas, matching ingredients order)"
          value={quantities}
          onChange={(e) => {
            if (e.target.value.length <= QUANTITIES_LIMIT) {
              setQuantities(e.target.value)
            }
          }}
        />
        <p className="char-count">
          {quantities.length}/{QUANTITIES_LIMIT} characters
        </p>
        <textarea
          placeholder="Instructions"
          value={instructions}
          onChange={(e) => {
            if (e.target.value.length <= INSTRUCTIONS_LIMIT) {
              setInstructions(e.target.value)
            }
          }}
        />
        <p className="char-count">
          {instructions.length}/{INSTRUCTIONS_LIMIT} characters
        </p>
        <label>Difficulty (1-5):</label>
        <input type="number" min="1" max="5" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select a category</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
          <option value="dessert">Dessert</option>
        </select>

        {/* Add dietary restriction dropdown */}
        <label>Dietary Restriction:</label>
        <select
          value={dietaryRestriction || ""}
          onChange={(e) => setDietaryRestriction(e.target.value === "" ? null : e.target.value)}
          className="dietary-dropdown"
        >
          <option value="">None</option>
          <option value="keto">Keto</option>
          <option value="vegan">Vegan</option>
          <option value="vegetarian">Vegetarian</option>
        </select>

        <input type="file" onChange={handleFileChange} />

        <div className="nutrition-section">
          <h3>Optional Nutritional Information</h3>

          <div className="nutrient-input">
            <input
              type="number"
              step="any"
              inputMode="numeric"
              pattern="\d*"
              placeholder="Calories"
              value={calories}
              onChange={(e) => {
                if (e.target.value.length <= NUTRITION_CHAR_LIMIT) {
                  setCalories(e.target.value)
                }
              }}
            />
            <span className="unit-label">kcal</span>
          </div>

          <div className="nutrient-input">
            <input
              type="number"
              step="any"
              inputMode="numeric"
              pattern="\d*"
              placeholder="Total Fat"
              value={totalFat}
              onChange={(e) => {
                if (e.target.value.length <= NUTRITION_CHAR_LIMIT) {
                  setTotalFat(e.target.value)
                }
              }}
            />
            <span className="unit-label">g</span>
          </div>

          <div className="nutrient-input">
            <input
              type="number"
              step="any"
              inputMode="numeric"
              pattern="\d*"
              placeholder="Cholesterol"
              value={cholesterol}
              onChange={(e) => {
                if (e.target.value.length <= NUTRITION_CHAR_LIMIT) {
                  setCholesterol(e.target.value)
                }
              }}
            />
            <span className="unit-label">mg</span>
          </div>

          <div className="nutrient-input">
            <input
              type="number"
              step="any"
              inputMode="numeric"
              pattern="\d*"
              placeholder="Total Carbohydrates"
              value={totalCarbohydrates}
              onChange={(e) => {
                if (e.target.value.length <= NUTRITION_CHAR_LIMIT) {
                  setTotalCarbohydrates(e.target.value)
                }
              }}
            />
            <span className="unit-label">g</span>
          </div>

          <div className="nutrient-input">
            <input
              type="number"
              step="any"
              inputMode="numeric"
              pattern="\d*"
              placeholder="Sugars"
              value={sugars}
              onChange={(e) => {
                if (e.target.value.length <= NUTRITION_CHAR_LIMIT) {
                  setSugars(e.target.value)
                }
              }}
            />
            <span className="unit-label">g</span>
          </div>

          <div className="nutrient-input">
            <input
              type="number"
              step="any"
              inputMode="numeric"
              pattern="\d*"
              placeholder="Protein"
              value={protein}
              onChange={(e) => {
                if (e.target.value.length <= NUTRITION_CHAR_LIMIT) {
                  setProtein(e.target.value)
                }
              }}
            />
            <span className="unit-label">g</span>
          </div>
        </div>

        <div className="button-container">
          <button className="submit-button" onClick={handleSubmit}>
            Submit Recipe
          </button>
        </div>
      </div>
    </div>
  )
}
export default CreateRecipe

