import React, { useState, useEffect } from "react";
import { useNavigate,useParams } from "react-router-dom";
import styles from "./explore_page.module.css";

function SearchResults() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const { recipe_name } = useParams();
  const [dietaryRestriction, setDietaryRestriction] = useState("none")

  async function fetchRecipes(dietary) {
    try {
      const url =
      dietaryRestriction !== "none"
        ? `https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_recipes_by_name.php?dietary=${encodeURIComponent(dietaryRestriction)}&name=${encodeURIComponent(recipe_name)}`
        : `https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_recipes_by_name.php?name=${encodeURIComponent(recipe_name)}`

      const response = await fetch(url);
      const data = await response.json();
      
      if(data.success){
          setRecipes(data.recipes || []);
          console.log("Success!")
          console.log(data.recipes)
      }else{
          setRecipes([]);
          console.log(data.message)
      }
      
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }

  useEffect(() => {
    console.log(recipe_name)
    fetchRecipes(dietaryRestriction);
  },[dietaryRestriction]);
  function handleRecipeClick(value) {
    navigate(`/recipe/${value}`)
  }
  const handleDietaryChange = (e) => {
    setDietaryRestriction(e.target.value)
    }

  return (
    <div className={styles["main-content"]}>
      <div className={styles["meal-header"]}>
        <h1>Top Search Results for "{recipe_name}"</h1>
        <select className="dietary-dropdown"  value={dietaryRestriction} onChange={handleDietaryChange}>
                <option value="none">No Dietary Restriction</option>
                <option value="keto">Keto</option>
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
              </select>
      </div>
      <div className="recipe-grid">
                {recipes.map((recipe, index) => (
                  <div key={index} className="recipe-card">
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
    </div>
  );
}

export default SearchResults;
