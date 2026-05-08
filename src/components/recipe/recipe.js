import React, { useState, useEffect } from 'react';
import './recipe.css';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Sidebar from '../sidebar/sidebar';
import defaultPFP from '../assets/defaultPFP.jpg';
import { FaArrowLeft, FaUtensils, FaCamera, FaLeaf, FaInfoCircle } from "react-icons/fa"

function Topbar() {
  return (
    <div className="recipe-topbar">
      <h1>Recipe</h1>
    </div>
  );
}

function RecipeInfo(input) {
  const id = parseInt(input.id);
  const navigate = useNavigate();

  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const [sharedBy, setSharedBy] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch(
        "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/auth.php",
        { method: "GET", credentials: "include" }
      );
      const data = await response.json();
      if (data.message === "logged in") {
        setLoggedInUserId(data.id);
        setSharedBy(data.username);
        console.log("👤 sharedBy from auth:", data.username);
        console.log("LOGGED " + data.id);
    } else if (data.message === "not logged in") {
        console.log("NOTLOGGED");
        navigate("/login");
      } else {
        console.log("Failed");
        navigate("/login");
      }
    }
    checkAuth();
  }, [navigate]);

  const [theme, setTheme] = useState('light');
  useEffect(() => {
    fetch('https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_theme.php')
      .then((response) => response.json())
      .then((data) => {
        if (data.theme) {
          setTheme(data.theme);
          document.documentElement.setAttribute('data-theme', data.theme);
        }
      })
      .catch((error) => console.error('Error fetching theme:', error));
  }, []);

  const [recName, setName] = useState("RecipeName");
  const [recIngredients, setIngredients] = useState([{ ingredient: "", qty: "" }]);
  const [recSteps, setSteps] = useState("");
  const [recDiff, setDiff] = useState(1);
  const [recRating, setRating] = useState("No Reviews for this recipe");
  const [recAuthor, setAuthor] = useState("Author");
  const [recAuthorId, setAuthorId] = useState("");
  const [recImage, setImage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isAuthor, setIsAuthor] = useState("NOTAuthor");
  const [profilePic, setProfilePic] = useState(defaultPFP);
  const [delStatus, setDelStatus] = useState('_');
  // State for nutritional information
  const [nutrition, setNutrition] = useState({
    calories: 0,
    total_fat: 0,
    cholesterol: 0,
    total_carbohydrates: 0,
    sugars: 0,
    protein: 0,
  });
  const [editMode, setEditMode] = useState(false);

  const handleNutritionChange = (key, value) => {
    setNutrition({
      ...nutrition,
      [key]: value,
    });
  };

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipe_id: id }),
        };
        const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_feedback.php", requestOptions);
        const data = await response.json();
        if (data.success) {
          setRating(data.rating || "No Ratings Found");
          console.log(data.total);
          console.log(data.num);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching rating", error);
      }
    }
    fetchFeedback();
  }, [id]);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipe_id: id }),
        };
        const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_recipe.php", requestOptions);
        const data = await response.json();
        if (data.success) {
          setName(data.name || "Recipe Name");
          setIngredients(JSON.parse(data.ingredients) || []);
          setSteps(data.steps || "");
          setDiff(data.diff || 1);
          setRating(data.rating || "No Ratings Found");
          setAuthor(data.author || "Author");
          setAuthorId(data.author_id || "");
          setImage(data.image_url || "");
          setIsAuthor(data.isAuthor || "NOTAuthor");
          setProfilePic(data.profile_picture || defaultPFP);
          // Set nutrition state from individual nutrient fields returned from get_recipe.php
          setNutrition({
            calories: data.calories,
            total_fat: data.total_fat,
            cholesterol: data.cholesterol,
            total_carbohydrates: data.total_carbohydrates,
            sugars: data.sugars,
            protein: data.protein,
          });
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching recipe data:", error);
      }
    }
    fetchRecipe();
  }, [id]);

  useEffect(() => {
    async function checkIfSaved() {
      try {
        const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/check_saved.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ recipe_id: id }),
        });
        const result = await response.json();
        if (result.success) {
          setIsSaved(result.check_save); 
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    }
    checkIfSaved();
  }, [id]);

  const handleSaveRecipe = async () => {
    const formData = new FormData();
    formData.append("recipe_id", id);
    formData.append("csrf_token", document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1]);
    try {
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/save_recipe.php", {
        method: "POST",
        credentials: "include",
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        setIsSaved(!isSaved);
        setSaveMessage("Success!!");
      } else {
        setSaveMessage("Failed to save recipe: " + result.message);
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      setSaveMessage("Error saving recipe. Please try again.");
    }
  };

  const handleDeleteRecipe = async () => {
    const formData = new FormData();
    formData.append("rec_id", id);
    formData.append("csrf_token", document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1]);
    try {
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/delete_recipe.php", {
        method: "POST",
        credentials: "include",
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        setDelStatus("Recipe Deleted");
      } else {
        setDelStatus(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    document.getElementById("recipe-modal").style.display = "block";
  };

  const hideModal = () => {
    document.getElementById("recipe-modal").style.display = "none";
    navigate("/explore");
  };

  const handleSendShareEmail = async () => {
    if (!recipientEmail) {
      setShareStatus("❗ Please enter a valid email.");
      return;
    }
    const recipeLink = window.location.href;
    const formData = new FormData();
    formData.append("email", recipientEmail);
    formData.append("link", recipeLink);
    formData.append("name", recName);
    formData.append("shared_by", sharedBy);
    formData.append("csrf_token", document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1]);
    try {
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/send_recipe_email.php", {
        method: "POST",
        credentials: "include",
        body: formData
      });
      const result = await response.json();
      if (result.status === "success") {
        setShareStatus("✅ Email sent successfully!");
        setTimeout(() => {
          setShowShareModal(false);
          setShareStatus("");
          setRecipientEmail("");
        }, 1500);
      } else {
        setShareStatus("❌ " + result.message);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setShareStatus("❌ Failed to send email.");
    }
  };
  const handlePlannerSave = () => {
    navigate(`/planner/${id}`)
  };

  const handleSaveChanges = async () => {
    const formData = new FormData();
    formData.append("recipe_id", id);
    formData.append("name", recName);
    formData.append("ingredients", JSON.stringify(recIngredients));
    formData.append("steps", recSteps);
    formData.append("diff", recDiff);
    formData.append("nutrition", JSON.stringify(nutrition));
    formData.append("csrf_token", document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1]);
  
    try {
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/update_recipe.php", {
        method: "POST",
        credentials: "include",
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        setEditMode(false);
      } else {
        //alert("Failed to update: " + result.message);
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
      //alert("Error updating recipe. Please try again.");
    }
  };
  

  return (
    <div className="recipe-info">
      <div id="recipe-modal" className="review-modal">
        <div className="review-modal-content">
          <p>{delStatus}</p>
          <span id="close" className="close" onClick={hideModal}>Close</span>
        </div>
      </div>
      {editMode ? (
          <input
            className='rec-header'
            value={recName}
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          <h2 className='rec-header'>{recName}</h2>
        )}

      <div className="recipe-picture-container">
        <img src={recImage} alt="Recipe" className="recipe-picture" />
      </div>
      <button onClick={handleDeleteRecipe} className={isAuthor}>Delete</button>
      {isAuthor === "isAuthor" && (
        <button 
          className="edit-recipe-button" 
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "Cancel" : "Edit Recipe"}
        </button>
      )}

      <button className="save-recipe-button" onClick={handleSaveRecipe}>
        {isSaved ? "Unsave Recipe" : "Save Recipe"}
      </button>
      <button onClick={handlePlannerSave} className="planner-save-button">Save to Planner</button>
      <button className="save-recipe-button" onClick={() => setShowShareModal(true)}>Share</button>
      {showShareModal && (
        <div className="share-modal">
          <div className="share-modal-content">
            <h3>Share this recipe</h3>
            <input
              className="input-field"
              type="email"
              placeholder="Recipient's email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
            <button className="btn send-button" onClick={handleSendShareEmail}>Send</button>
            <button className="close" onClick={() => setShowShareModal(false)}>Cancel</button>
            {shareStatus && <p>{shareStatus}</p>}
          </div>
        </div>
      )}
      <span className='rec-detail'>Author:</span>
      <div className="profile">
        <img src={profilePic} alt="Profile" className="profile-picture" />
        <div className="rec-body">
          <Link
            to={
              loggedInUserId && recAuthorId && loggedInUserId === parseInt(recAuthorId)
                ? "/profile"
                : `/profile/${recAuthorId}`
            }
            className="author-link"
          >
            {recAuthor}
          </Link>
        </div>
      </div>
      <span className='rec-detail'>Difficulty: </span>
      {editMode ? (
        <input
          type="number"
          min="1"
          max="5"
          value={recDiff}
          onChange={(e) => setDiff(parseInt(e.target.value))}
        />
      ) : (
        <div className="rec-body">{recDiff}</div>
      )}
      <span className='rec-detail'>Community Rating: </span>
      <div className="rec-body">{recRating}</div>
      <span className="rec-detail">Ingredients: </span>
      <div className="rec-body-container">
      {editMode ? (
        <>
          {/* Add Ingredient Button */}
          <button
            type="button"
            onClick={() => setIngredients([...recIngredients, { ingredient: "", qty: "" }])}
            className="edit-recipe-button"
          >
            Add Ingredient
          </button>

          {/* Ingredient Inputs */}
          {recIngredients.map((ingredient, i) => (
            <div key={i} className="edit-ingredient-container">
              <input
                type="text"
                placeholder="Ingredient"
                value={ingredient.ingredient}
                onChange={(e) => {
                  const newIngredients = [...recIngredients];
                  newIngredients[i].ingredient = e.target.value;
                  setIngredients(newIngredients);
                }}
              />
              <input
                type="text"
                placeholder="Quantity"
                value={ingredient.qty}
                onChange={(e) => {
                  const newIngredients = [...recIngredients];
                  newIngredients[i].qty = e.target.value;
                  setIngredients(newIngredients);
                }}
              />
              <button
                type="button"
                className="edit-recipe-button"
                onClick={() => {
                  const newIngredients = [...recIngredients];
                  newIngredients.splice(i, 1); // Remove ingredient if needed
                  setIngredients(newIngredients);
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </>
      ) : (
        recIngredients.map((ingredient, i) => (
          <div key={i}>
            <span className="rec-body">{ingredient.qty} {ingredient.ingredient}</span>
          </div>
        ))
      )}
      </div>
      <span className='rec-detail'>Instructions: </span>
      {editMode ? (
        <textarea
          className="rec-body"
          rows={5}
          value={recSteps}
          onChange={(e) => setSteps(e.target.value)}
        />
      ) : (
        <pre className="rec-body">{recSteps}</pre>
      )}
      {editMode ? (
        <div className="nutrition-section">
          <h3>
            <FaInfoCircle /> Edit Nutritional Information (Optional)
          </h3>

          {/* Nutrition Grid Layout */}
          <div className="nutrition-grid">
            {/* Calories */}
            <div className="nutrient-input">
              <label htmlFor="calories">Calories</label>
              <div className="input-with-unit">
                <input
                  id="calories"
                  type="number"
                  step="any"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="0"
                  value={nutrition.calories}
                  onChange={(e) => handleNutritionChange('calories', e.target.value)}
                />
                <span className="unit-label">kcal</span>
              </div>
            </div>

            {/* Total Fat */}
            <div className="nutrient-input">
              <label htmlFor="total-fat">Total Fat</label>
              <div className="input-with-unit">
                <input
                  id="total-fat"
                  type="number"
                  step="any"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="0"
                  value={nutrition.total_fat}
                  onChange={(e) => handleNutritionChange('total_fat', e.target.value)}
                />
                <span className="unit-label">g</span>
              </div>
            </div>

            {/* Cholesterol */}
            <div className="nutrient-input">
              <label htmlFor="cholesterol">Cholesterol</label>
              <div className="input-with-unit">
                <input
                  id="cholesterol"
                  type="number"
                  step="any"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="0"
                  value={nutrition.cholesterol}
                  onChange={(e) => handleNutritionChange('cholesterol', e.target.value)}
                />
                <span className="unit-label">mg</span>
              </div>
            </div>

            {/* Total Carbohydrates */}
            <div className="nutrient-input">
              <label htmlFor="carbs">Total Carbohydrates</label>
              <div className="input-with-unit">
                <input
                  id="carbs"
                  type="number"
                  step="any"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="0"
                  value={nutrition.total_carbohydrates}
                  onChange={(e) => handleNutritionChange('total_carbohydrates', e.target.value)}
                />
                <span className="unit-label">g</span>
              </div>
            </div>

            {/* Sugars */}
            <div className="nutrient-input">
              <label htmlFor="sugars">Sugars</label>
              <div className="input-with-unit">
                <input
                  id="sugars"
                  type="number"
                  step="any"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="0"
                  value={nutrition.sugars}
                  onChange={(e) => handleNutritionChange('sugars', e.target.value)}
                />
                <span className="unit-label">g</span>
              </div>
            </div>

            {/* Protein */}
            <div className="nutrient-input">
              <label htmlFor="protein">Protein</label>
              <div className="input-with-unit">
                <input
                  id="protein"
                  type="number"
                  step="any"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="0"
                  value={nutrition.protein}
                  onChange={(e) => handleNutritionChange('protein', e.target.value)}
                />
                <span className="unit-label">g</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="nutrition-info">
          <h3>Nutritional Information:</h3>
          <ul>
            {nutrition.calories && <li className="nutritional-detail">Calories: {nutrition.calories}</li>}
            {nutrition.total_fat && <li className="nutritional-detail">Total Fat: {nutrition.total_fat}g</li>}
            {nutrition.cholesterol && <li className="nutritional-detail">Cholesterol: {nutrition.cholesterol}mg</li>}
            {nutrition.total_carbohydrates && <li className="nutritional-detail">Total Carbohydrates: {nutrition.total_carbohydrates}g</li>}
            {nutrition.sugars && <li className="nutritional-detail">Sugars: {nutrition.sugars}g</li>}
            {nutrition.protein && <li className="nutritional-detail">Protein: {nutrition.protein}g</li>}
          </ul>
        </div>
      )}
      {editMode && (
        <div className="edit-controls">
        <button className="save-changes-button" onClick={handleSaveChanges}>
          Save Changes
        </button>
      </div>
      )}
    </div>
  );
}

function Feedback(input) {
      const id = parseInt(input.id);
      const [feedback, setFeedback] = useState([]);
      const [SendFeed, setSendFeed] = useState("");
      const [SendRate, setSendRate] = useState('1');
      const [status, setStatus] = useState('_');
      const REVIEW_CHARACTER_LIMIT = 200;
    
      const [loggedInUserId, setLoggedInUserId] = useState(null);
      useEffect(() => {
        async function fetchUser() {
          const response = await fetch(
            "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/auth.php",
            { method: "GET", credentials: "include" }
          );
          const data = await response.json();
          if (data.message === "logged in") {
            setLoggedInUserId(data.id);
          }
        }
        fetchUser();
      }, []);
    
      async function fetchFeedback() {
        try {
          const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipe_id: id }),
          };
          const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_feedback.php", requestOptions);
          const data = await response.json();
          if (data.success) {
            setFeedback(JSON.parse(data.feedback) || []);
            console.log(feedback);
          } else {
            setFeedback([]);
            console.error(data.message);
          }
        } catch (error) {
          console.error("Error fetching feedback", error);
        }
      }
      useEffect(() => {
        fetchFeedback();
      }, [id]);
    
      const handleSendFeed = async () => {
        var rating = parseInt(SendRate);
        if (!rating || !SendFeed || rating > 5 || rating < 1) {
          alert("Invalid Feedback");
          return;
        }
        const formData = new FormData();
        formData.append("rec_id", id);
        formData.append("rating", rating);
        formData.append("feedback", SendFeed);
        formData.append("csrf_token", document.cookie
          .split("; ")
          .find((row) => row.startsWith("csrf_token="))
          ?.split("=")[1]);
        try {
          const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/update_feedback.php", {
            method: "POST",
            credentials: "include",
            body: formData
          });
          const result = await response.json();
          if (result.success) {
            setStatus("Feedback Submitted!");
          } else {
            setStatus(result.message);
          }
        } catch (error) {
          console.error("Error:", error);
        }
        fetchFeedback();
        document.getElementById("review-modal").style.display = "block";
      };
    
      const handleDeleteReview = async () => {
        const formData = new FormData();
        formData.append("rec_id", id);
        formData.append("csrf_token", document.cookie
          .split("; ")
          .find((row) => row.startsWith("csrf_token="))
          ?.split("=")[1]);
        try {
          const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/delete_review.php", {
            method: "POST",
            credentials: "include",
            body: formData
          });
          const result = await response.json();
          if (result.success) {
            setStatus("Review Deleted");
          } else {
            setStatus(result.message);
          }
        } catch (error) {
          console.error("Error:", error);
        }
        fetchFeedback();
        document.getElementById("review-modal").style.display = "block";
      };
    
      const hideModal = () => {
        document.getElementById("review-modal").style.display = "none";
      };
    
      return (
        <div>
          <label className="rev-label" htmlFor="rating">
            Give a rating of 1 to 5 for this recipe, 1 being the lowest, 5 being the highest:
          </label>
          <br />
          <label className="rev-label">
            If you have already left a review, leaving another one will update the existing one
          </label>
          <br />
          <select className="review-select" id="rating" onChange={(e) => setSendRate(e.target.value)}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          <br />
          <textarea 
            className='review-input'
            placeholder='Leave your review'
            value={SendFeed}
            onChange={(e) => { 
              if (e.target.value.length <= REVIEW_CHARACTER_LIMIT) {
                setSendFeed(e.target.value);
              }
            }}
          />
          <p>{SendFeed.length}/{REVIEW_CHARACTER_LIMIT} characters</p>
          <br />
          <button className="review-submit" onClick={handleSendFeed}>Submit</button>
          <div id="review-modal" className="review-modal">
            <div className="review-modal-content">
              <div className = "review-modal-text">{status}</div>
              <div id="close" className="close" onClick={hideModal}>Close</div>
            </div>
          </div>
          <div className="rec-body-container">
            {feedback.map((rev, i) => (
              <div key={i} className="review">
                <button onClick={handleDeleteReview} className={rev.isUser}>Delete</button>
                <div className="profile">
                  <img src={rev.profile_picture||defaultPFP} alt="Profile" className="profile-picture" />
                  <Link
                    to={
                      parseInt(rev.author_id) === loggedInUserId
                        ? "/profile"
                        : `/profile/${rev.author_id}`
                    }
                    className="author-link"
                  >
                    {rev.author}
                  </Link>
                </div>
                <div className="review-detail">Rating: {rev.rating}</div>
                <div className="review-detail">Feedback: {rev.feedback}</div>
              </div>
            ))}
          </div>
        </div>
      );
}

function RecipePage() {
  const { recipe_id } = useParams();
  return (
    <div className="recipe-app-container">
      <Sidebar />
      <div className="recipe-content-wrapper">
        <Topbar />
        <div className="recipe-main-content">
          <RecipeInfo id={recipe_id} />
          <Feedback id={recipe_id} />
        </div>
      </div>
    </div>
  );
}

export default RecipePage;
