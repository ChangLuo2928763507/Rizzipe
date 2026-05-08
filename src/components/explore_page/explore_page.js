import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Select from "react-select";
import styles from "./explore_page.module.css";
import Sidebar from "../sidebar/sidebar";

const meals = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "dessert", label: "Dessert" },
  { value: "snack", label: "Snack" },
];

function Explore() {
    const navigate = useNavigate();
    let [loggedin, setLogin] = useState(null)
    useEffect(() => {
      async function checkAuth() {
        const response = await fetch(
          "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/auth.php", {
        method: "GET"}
        );
        const data = await response.json();
        setLogin(data.message);
        if(data.message==="logged in"){
          console.log("LOGGED" + data.id)
        }else if(data.message === "not logged in"){
          console.log("NOTLOGGED")
          navigate("/login")
        }else{
          console.log("Failed")
          navigate("/login")
        }
      };
  
      checkAuth();
        
    }, []);

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

  const location = useLocation();
  const [selectedMeal, setSelectedMeal] = useState(null);
  
 
  useEffect(() => {
    if (location.pathname === "/explore") {
      setSelectedMeal(null);
      sessionStorage.removeItem("selectedMeal");
    } else {
      setSelectedMeal(sessionStorage.getItem("selectedMeal") || null);
    }
  }, [location.pathname]);

  function changeMeal(selectedOption) {
    sessionStorage.setItem("selectedMeal", selectedOption.value);
    setSelectedMeal(selectedOption.value);
    navigate(`/explore/${selectedOption.value}`);
  }
  function signOut(){
    const response = fetch(
      "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/auth.php", {
    method: "POST"}
    );
    console.log("WRONG")
    navigate("/login");
  }

  const [username, setUsername] = useState("");
  
    useEffect(() => {
      async function fetchUsername() {
        try {
          const response = await fetch(
            "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/server/get_profile.php",
            { credentials: "include" }
          );
          const data = await response.json();
          if (data.success) {
            setUsername(data.username || "Unknown User");
          } else {
            setUsername("Guest");
          }
        } catch (error) {
          console.error("Error fetching username:", error);
          setUsername("Guest");
        }
      }
      fetchUsername();
    }, []);


  return (
    <div className={styles["app-container"]}>
      <Sidebar/>
      <div className={styles["content-wrapper"]}>
        <div className={styles["topbar"]}>
          <h1>Explore</h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default Explore;