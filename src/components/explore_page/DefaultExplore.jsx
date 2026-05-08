"use client"

import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef} from "react"
import breakfast_image from "../assets/breakfast_image.jpg"
import lunch_image from "../assets/lunch_image.jpg"
import dinner_image from "../assets/dinner_image.jpg"
import dessert_image from "../assets/dessert_image.jpg"
import snack_image from "../assets/snack_image.jpg"
import styles from "./explore_page.module.css"

const meals = [
  { value: "breakfast", label: "Breakfast", image: breakfast_image },
  { value: "lunch", label: "Lunch", image: lunch_image },
  { value: "dinner", label: "Dinner", image: dinner_image },
  { value: "dessert", label: "Dessert", image: dessert_image },
  { value: "snack", label: "Snack", image: snack_image },
]

function DefaultExplore() {
  const navigate = useNavigate()

  // State and function for fetching a random recipe
  const [randomRecipe, setRandomRecipe] = useState(null)

  const fetchRandomRecipe = async () => {
    try {
      const response = await fetch(
        "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_random_recipe.php",
        { method: "GET", credentials: "include" },
      )
      const data = await response.json()
      if (data.success) {
        setRandomRecipe(data.recipe)
      } else {
        console.error("Failed to fetch random recipe:", data.message)
        setRandomRecipe(null)
      }
    } catch (error) {
      console.error("Error fetching random recipe:", error)
      setRandomRecipe(null)
    }
  }

  // Fetch a random recipe on component mount
  useEffect(() => {
    fetchRandomRecipe()
  }, [])

  function handleCardClick(value) {
    navigate(`/explore/${value}`)
  }

  // Function for navigating to the recipe detail page using the recipe id
  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`)
  }

  

/////////////////////
useEffect(() => {
  fetchAvailableTags();
}, []);
const [searchInput, setSearchInput] = useState('');
const [filteredTags, setFilteredTags] = useState([]);
const searchInputRef = useRef(null);
const [availableTags, setAvailableTags] = useState([]);
const [inputFocused, setInputFocused] = useState(false);

const fetchAvailableTags = async () => {
  console.log("names fetched")
  try {
    const response = await fetch(
      "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_recipe_names.php", 
      { method: "GET", credentials: "include" }
    );
    const data = await response.json();
    if (data.success) {
      setAvailableTags(data.names);
      console.log(data.names)
    }
  } catch (error) {
    console.error("Error fetching tags:", error);
  }
};

const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    console.log("enter")
    e.preventDefault();
    handleSearch(searchInput);
  }
};

const handleSearch = (tag) => {
  console.log("search")
  // Case 1: Search field is empty
  if (!tag.trim()) {
    //show error
    return;
  }else{
    navigate(`/explore/search/${tag.trim()}`);
  }
};
const handleTagSelect = (tag) => {
  console.log("tagselect")
  setSearchInput(tag);
  handleSearch(tag);
};


useEffect(() => {
    if (searchInput.trim() === '') {
      setFilteredTags([]);
    } else {
      const lowerInput = searchInput.toLowerCase().trim();
      const filtered = availableTags.filter(tag => {
        const lowerTag = tag.toLowerCase();
        
        // Skip if search input is longer than the tag
        if (lowerInput.length > lowerTag.length) return false;
        
        // Check if the tag contains the input characters in order
        let inputIndex = 0;
        for (let tagIndex = 0; tagIndex < lowerTag.length; tagIndex++) {
          if (lowerTag[tagIndex] === lowerInput[inputIndex]) {
            inputIndex++;
            if (inputIndex === lowerInput.length) return true;
          }
        }
        return false;
      });
      
      setFilteredTags(filtered);
    }

    // Ensure suggestions show when typing after a failed search
    if (searchInput.trim() && searchInputRef.current === document.activeElement) {
      setInputFocused(true);
    }
  }, [searchInput, availableTags]);
  const handleInputBlur = () => {
    setTimeout(() => {
      if (!document.activeElement?.classList?.contains('tag-suggestion')) {
        setInputFocused(false);
      }
    }, 200);
  };
  const handleInputFocus = () => {
    setInputFocused(true);
    if (searchInput.trim()) {
      const lowerInput = searchInput.toLowerCase().trim();
      const filtered = availableTags.filter(tag => {
        const lowerTag = tag.toLowerCase();
        if (lowerInput.length > lowerTag.length) return false;
        
        let inputIndex = 0;
        for (let tagIndex = 0; tagIndex < lowerTag.length; tagIndex++) {
          if (lowerTag[tagIndex] === lowerInput[inputIndex]) {
            inputIndex++;
            if (inputIndex === lowerInput.length) return true;
          }
        }
        return false;
      });
      setFilteredTags(filtered);
    }
  };
  return (
    <div className={styles["main-content"]}>
      <div className={styles["diff-bar"]}>
        <div className={styles["flavor-text"]}>What are we making?</div>
        <button className={styles["diff-button"]} onClick={() => navigate("/explore/difficulty")}>Try something on your level</button>
      </div>
      <div className="search-container">
            <div className="search-bar-container">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for recipes..."
                className="search-input"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  // Show suggestions when typing
                  if (e.target.value.trim()) {
                    setInputFocused(true);
                  }
                }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
              />
            </div>
            
            {inputFocused && filteredTags.length > 0 && (
              <div className="tag-suggestions">
                {filteredTags.map((name, index) => (
                  <div 
                    key={index} 
                    className="tag-suggestion"
                    onClick={() => handleTagSelect(name)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
            
            {inputFocused && searchInput.trim() && filteredTags.length === 0 && (
              <div> </div>
            )}
            
          </div>



      {/* card menu */}
      <div className={styles["meal-card-menu"]}>
        {meals.map((meal) => (
          <div key={meal.value} className={styles["meal-card-item"]} onClick={() => handleCardClick(meal.value)}>
            <img src={meal.image || "/placeholder.svg"} alt={meal.label} className={styles["meal-card-img"]} />
            <span className={styles["meal-card-label"]}>{meal.label}</span>
          </div>
        ))}
      </div>

      {/* Random Recommendation Section */}
      <h3 className={styles["randomizer-title"]}>Maybe something random?</h3>
      <div className={styles["refresh-button-container"]}>
      <button className={styles["refresh-button"]} onClick={fetchRandomRecipe}>
        Try Something Else
      </button>
      </div>

      {randomRecipe && (
        <div className={styles["random-recipe-grid"]}>
          <div className={styles["random-recipe-card"]}>
            <img
              src={randomRecipe.image || "/placeholder.svg"}
              alt={randomRecipe.name}
              className={styles["recipe-image"]}
            />
            <div className={styles["recipe-content"]}>
              <h3 className={styles["recipe-title"]}>{randomRecipe.name}</h3>
              <p className={styles["recipe-description"]}>{randomRecipe.steps}</p>
              <div className={styles["recipe-meta"]}>
                <p>Rating: {randomRecipe.rating}</p>
                <p>Difficulty: {randomRecipe.diff}</p>
              </div>
              <button onClick={() => handleRecipeClick(randomRecipe.id)} className={styles["recipe-button"]}>
                View Recipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DefaultExplore