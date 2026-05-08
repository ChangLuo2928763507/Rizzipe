import React, { useState, useEffect } from 'react';
import './Planner.css';
import './Calendar.css'
import { useNavigate, useParams, Link } from 'react-router-dom';
import Sidebar from '../sidebar/sidebar';
import Calendar from 'react-calendar';

function Topbar() {
  return (
    <div className="planner-topbar">
      <h1>Meal Planner</h1>
    </div>
  );
}

// type ValuePiece = Date | null;

// type Value = ValuePiece | [ValuePiece, ValuePiece];


function MealList(input) {
  const id = parseInt(input.id);
  const add = input.add;
  const [date, setDate] = useState(new Date());
  const [timeList, setTimes] = useState({});
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  function onChange(nextDate) {
    setDate(nextDate);
    fetchTimes(nextDate);
    console.log(nextDate)
  }

  function handleRecipeClick(value) {
    navigate(`/recipe/${value}`)
  }

  const fetchTimes= async (date) => {
    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({year:date.getFullYear(),month:date.getMonth()+1,day:date.getDate() }),
      };
      const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_planner.php", requestOptions);
      const data = await response.json();
      if (data.success) {
        setTimes(JSON.parse(data.times) || []);
        console.log("Get time successful");
        console.log(data.message)
        console.log(timeList);
        console.log(data.times);
      } else {
        setTimes({});
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching times", error);
    }
  } 
  useEffect(() => {
fetchTimes(date);
},[]);

const handleSendTimes= async (meal) => {
  console.log(meal);
  const formData = new FormData();
  formData.append("recipe_id", id);
  formData.append("year", date.getFullYear());
  formData.append("month", date.getMonth()+1);
  formData.append("day", date.getDate());
  formData.append("meal", meal);
  formData.append("csrf_token", document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1]);
  try {
    const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/update_planner.php", {
      method: "POST",
      credentials: "include",
      body: formData
    });
    const result = await response.json();
    if (result.success) {
      setStatus("Planner Updated!");
    } else {
      setStatus(result.message);
      console.log(result.message)
    }
  } catch (error) {
    console.error("Error:", error);
  }
  fetchTimes(date)
  navigate("/planner/view");
};
const deleteEntry= async (input) => {
  const formData = new FormData();
  formData.append("recipe_id", input.id);
  formData.append("year", date.getFullYear());
  formData.append("month", date.getMonth()+1);
  formData.append("day", date.getDate());
  formData.append("meal", input.meal);
  formData.append("csrf_token", document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1]);
  try {
    const response = await fetch("https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/delete_planner.php", {
      method: "POST",
      credentials: "include",
      body: formData
    });
    const result = await response.json();
    if (result.success) {
      setStatus("Planner Updated!");
      console.log(result.message)
    } else {
      setStatus(result.message);
      console.log(result.message)
    }
  } catch (error) {
    console.error("Error:", error);
  }
  fetchTimes(date);
};
function numToMeal(num){
  if(num==0){
    return "Breakfast"
  }else if(num==1){
    return "Lunch"
  } else if(num==2){
    return "Dinner"
  }else if (num==3){
    return "Dessert"
  }else {
    return "Snack"
  }
}
  return (
    <div className="planner-container">
      <div>
     <Calendar className ="react-calendar" onChange={onChange}  value={date} />
     </div>
    <div className="meal-list-body-container">
        {Object.keys(timeList).map((time,i) => (
          <div key={i}>
            <div className = "meal-header">{numToMeal(time)}</div><hr className = "planner-divider"></hr>
            <button className = {add} onClick={()=>handleSendTimes(numToMeal(time))}>+</button>
            <div className = "planner-grid">
              {timeList[time].map((recipe,k) => (
              <div key={k} className="planner-card" >
              <img src={recipe.image || "/placeholder.svg"} alt={recipe.name} className="planner-image" />
              <div className="planner-content">
                <h3 className="planner-title">{recipe.name}</h3>
                <div className="planner-meta">
                  <p>Rating: {recipe.rating}</p>
                  <p>Difficulty: {recipe.diff}</p>
                </div>
                <div className="planner-buttons-container">
                <button onClick={() => deleteEntry({id:recipe.id,meal:numToMeal(time)})} className="planner-delete">
                        Delete
                      </button>
                <button onClick={() => handleRecipeClick(recipe.id)} className="planner-button">
                  View
                </button>
                </div>
              </div>
            </div>
        ))}
</div>
          </div>
        ))}
      </div>
    </div>
  );
}



function MealPlanner() {
  const navigate = useNavigate();
  const { recipe_id } = useParams();
  const [add, setAdd] = useState("noAdd");

  useEffect(() => {
    if (recipe_id==="view"){
      setAdd("noAdd");
    }else{
      setAdd("Add")
    }
      async function checkAuth() {
        const response = await fetch(
          "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/auth.php",
          { method: "GET", credentials: "include" }
        );
        const data = await response.json();
        // Set the loggedInUserId from auth data (assumes data.id is provided)
        if (data.message === "logged in") {
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
    
  return (
    <div className = "planner-app-container"> 
      <Sidebar />
      <div className = "planner-content-wrapper">
        <Topbar />
        <div className = "planner-main-content">
        <MealList id={recipe_id} add={add} />
        </div>
      </div>
    </div>
  );
}

export default MealPlanner;
