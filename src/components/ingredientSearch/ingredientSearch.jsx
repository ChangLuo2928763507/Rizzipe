"use client"
import "./ingredientSearch.css"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import Sidebar from "../sidebar/sidebar"

function Topbar() {
  return (
    <div className="search-topbar">
      <h1>Ingredient Search Page</h1>
    </div>
  )
}

const IngredientSearch = () => {
  const navigate = useNavigate()
  const [theme, setTheme] = useState("light")
  const [searchInput, setSearchInput] = useState("")
  const [recipes, setRecipes] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const [filteredTags, setFilteredTags] = useState([])
  const [showNoRecipesAlert, setShowNoRecipesAlert] = useState(false)
  const [searchAttempted, setSearchAttempted] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [invalidSearchTerm, setInvalidSearchTerm] = useState("")
  const searchInputRef = useRef(null)

  // Add state for dietary restriction
  const [dietaryRestriction, setDietaryRestriction] = useState("none")

  useEffect(() => {
    fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_theme.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.theme) {
          setTheme(data.theme)
          document.documentElement.setAttribute("data-theme", data.theme)
        }
      })

    setIsLoading(true)
    Promise.all([fetchAvailableTags(), fetchAllRecipes()]).finally(() => {
      setIsLoading(false)
      setIsInitialLoad(false)
    })
  }, [])

  useEffect(() => {
    if (!isInitialLoad && selectedTags.length > 0) {
      fetchRecipes()
    } else if (!isInitialLoad) {
      fetchAllRecipes()
    }
  }, [selectedTags, dietaryRestriction, isInitialLoad]) // Add dietaryRestriction to dependency array

  const fetchAvailableTags = async () => {
    try {
      const response = await fetch(
        "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_ingredient_tags.php",
        { method: "GET", credentials: "include" },
      )
      const data = await response.json()
      if (data.success) {
        setAvailableTags(data.tags)
      }
    } catch (error) {
      console.error("Error fetching tags:", error)
    }
  }

  const fetchAllRecipes = async () => {
    try {
      setIsLoading(true)
      // Add dietary restriction parameter if not 'none'
      const url =
        dietaryRestriction !== "none"
          ? `https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/search_recipes_by_tags.php?dietary=${encodeURIComponent(dietaryRestriction)}`
          : "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/search_recipes_by_tags.php"

      const response = await fetch(url, { method: "GET", credentials: "include" })
      const data = await response.json()

      if (data.success) {
        setRecipes(data.recipes)
        setShowNoRecipesAlert(false)
        setInvalidSearchTerm("")
      }
    } catch (error) {
      console.error("Error fetching all recipes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRecipes = async () => {
    try {
      setIsLoading(true)
      // Add dietary restriction parameter to the URL
      const url = `https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/search_recipes_by_tags.php?tags=${encodeURIComponent(selectedTags.join(","))}&dietary=${encodeURIComponent(dietaryRestriction)}`

      const response = await fetch(url, { method: "GET", credentials: "include" })
      const data = await response.json()

      if (data.success) {
        setRecipes(data.recipes)
        setShowNoRecipesAlert(false)
        setInvalidSearchTerm("")
      } else {
        setRecipes([])
        setShowNoRecipesAlert(true)
      }
      setSearchAttempted(true)
    } catch (error) {
      console.error("Error fetching recipes:", error)
      setRecipes([])
      setShowNoRecipesAlert(true)
      setSearchAttempted(true)
    } finally {
      setIsLoading(false)
    }
  }

  const findMatchingTag = (input) => {
    const lowerInput = input.toLowerCase().trim()

    // Don't search if input is empty
    if (!lowerInput) return null

    for (const tag of availableTags) {
      const lowerTag = tag.toLowerCase()

      // Skip if search input is longer than the tag
      if (lowerInput.length > lowerTag.length) continue

      // Check if the tag contains the input characters in order
      let inputIndex = 0
      for (let tagIndex = 0; tagIndex < lowerTag.length; tagIndex++) {
        if (lowerTag[tagIndex] === lowerInput[inputIndex]) {
          inputIndex++
          // If we've matched all input characters
          if (inputIndex === lowerInput.length) {
            return tag // Return the original tag (with original case)
          }
        }
      }
    }

    return null // No match found
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch()
    }
  }

  useEffect(() => {
    if (searchInput.trim() === "") {
      setFilteredTags([])
    } else {
      const lowerInput = searchInput.toLowerCase().trim()
      const filtered = availableTags.filter((tag) => {
        const lowerTag = tag.toLowerCase()

        // Skip if search input is longer than the tag
        if (lowerInput.length > lowerTag.length) return false

        // Check if the tag contains the input characters in order
        let inputIndex = 0
        for (let tagIndex = 0; tagIndex < lowerTag.length; tagIndex++) {
          if (lowerTag[tagIndex] === lowerInput[inputIndex]) {
            inputIndex++
            if (inputIndex === lowerInput.length) return true
          }
        }
        return false
      })
      setFilteredTags(filtered)
    }

    // Ensure suggestions show when typing after a failed search
    if (searchInput.trim() && searchInputRef.current === document.activeElement) {
      setInputFocused(true)
    }
  }, [searchInput, availableTags])

  const handleInputFocus = () => {
    setInputFocused(true)
    if (searchInput.trim()) {
      const lowerInput = searchInput.toLowerCase().trim()
      const filtered = availableTags.filter((tag) => {
        const lowerTag = tag.toLowerCase()
        if (lowerInput.length > lowerTag.length) return false

        let inputIndex = 0
        for (let tagIndex = 0; tagIndex < lowerTag.length; tagIndex++) {
          if (lowerTag[tagIndex] === lowerInput[inputIndex]) {
            inputIndex++
            if (inputIndex === lowerInput.length) return true
          }
        }
        return false
      })
      setFilteredTags(filtered)
    }
  }

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!document.activeElement?.classList?.contains("tag-suggestion")) {
        setInputFocused(false)
      }
    }, 200)
  }

  const handleTagSelect = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
    setSearchInput("")
    setFilteredTags([])
    setTimeout(() => {
      searchInputRef.current.focus()
    }, 50)
  }

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove))
  }

  // Add handler for dietary restriction changes
  const handleDietaryChange = (e) => {
    setDietaryRestriction(e.target.value)
    // The useEffect will trigger a re-fetch with the new dietary restriction
  }

  const handleSearch = () => {
    // Case 1: Search field is empty and no tags - show all recipes
    if (!searchInput.trim() && selectedTags.length === 0) {
      fetchAllRecipes()
      setShowNoRecipesAlert(false)
      setInvalidSearchTerm("")
      return
    }

    // Case 2: Search field is empty but there are tags - search by tags only
    if (!searchInput.trim() && selectedTags.length > 0) {
      fetchRecipes()
      return
    }

    // Case 3: There is search input - try to find matching tag
    setSearchAttempted(true)
    const matchingTag = findMatchingTag(searchInput)

    if (matchingTag) {
      handleTagSelect(matchingTag)
      return
    }

    // If no matching tag found
    setInvalidSearchTerm(searchInput.trim())
    setRecipes([])
    setShowNoRecipesAlert(true)

    // Keep the input focused and show suggestions
    searchInputRef.current.focus()
    setInputFocused(true)
  }

  function handleRecipeClick(value) {
    navigate(`/recipe/${value}`)
  }

  return (
    <div className={"search-app-container"}>
      <Sidebar />
      <div className="search-content-wrapper">
        <Topbar />
        <div className="main-content">
          <div className="search-title">Ingredient Based Search</div>

          <div className="search-container">
            <div className="search-bar-container">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for ingredients..."
                className="search-input"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value)
                  // Show suggestions when typing
                  if (e.target.value.trim()) {
                    setInputFocused(true)
                  }
                }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
              />

              {/* Add dietary restriction dropdown */}
              <select className="dietary-dropdown" value={dietaryRestriction} onChange={handleDietaryChange}>
                <option value="none">No Dietary Restriction</option>
                <option value="keto">Keto</option>
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
              </select>
            </div>

            {inputFocused && filteredTags.length > 0 && (
              <div className="tag-suggestions">
                {filteredTags.map((tag, index) => (
                  <div
                    key={index}
                    className="tag-suggestion"
                    onClick={() => handleTagSelect(tag)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}

            {inputFocused && searchInput.trim() && filteredTags.length === 0 && (
              <div className="no-tags-found">No matching ingredients found. Try a different search term.</div>
            )}

            {selectedTags.length > 0 && (
              <div className="selected-tags-container">
                {selectedTags.map((tag, index) => (
                  <div key={index} className="selected-tag">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="remove-tag-button">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="loading-spinner">Loading recipes...</div>
          ) : (
            <>
              {showNoRecipesAlert && (
                <div className="no-recipes-alert">
                  <p className="error-message">
                    {invalidSearchTerm
                      ? `No recipes found containing "${invalidSearchTerm}"`
                      : "No recipes found matching your search"}
                  </p>
                  <p className="recommendation">
                    Try searching for different ingredients or browse all recipes by clearing your search.
                  </p>
                </div>
              )}

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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default IngredientSearch