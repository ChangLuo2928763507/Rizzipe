import React from "react";
import "./App.css";
import {
    HashRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import RegisterPage from "./components/register/RegisterPage";
import Login from "./components/login/login";
import Home from "./components/home/home"
import ResetRequestPage from "./components/resetpassword/reset_request";
import ResetCodePage from "./components/resetpassword/reset_code";
import ResetNewPasswordPage from "./components/resetpassword/reset_newpassword";
import Explore from "./components/explore_page/explore_page";
import DefaultExplore from "./components/explore_page/DefaultExplore";
import MealPage from "./components/explore_page/MealPage";
import Settings from "./components/settings/settings";
import ProfilePage from "./components/ProfilePage/ProfilePage";
import IngredientSearch from "./components/ingredientSearch/ingredientSearch";
import ChangeRequestPage from "./components/changeemail/change_request";
import ChangeCodePage from "./components/changeemail/change_code";
import ChangeNewEmailPage from "./components/changeemail/change_newemail";
import EditProfilePage from "./components/ProfilePage/EditProfile";
import RecipePage from "./components/recipe/recipe";
import DifficultyPage from "./components/explore_page/DifficultyPage";
import CreateRecipe from "./components/CreateRecipe/CreateRecipe";
import DeleteAccount from "./components/delete/delete_account";
import StyleGuide from "./components/styleguide/styleguide";
import SavedRecipe from "./components/SavedRecipes/SavedRecipes"
import TrendingRecipesPage from "./components/TrendingRecipes/TrendingRecipes";
import PublicProfilePage from "./components/ProfilePage/viewing_public_profiles";
import MealPlanner from "./components/MealPlanner/viewPlanner";
import SearchResults from "./components/explore_page/RecipeSearch";

function App() {
    return (
      <>
            <Router>
                <Routes>
                    <Route path="/style-guide" element={<StyleGuide />} />
                    <Route
                        path="/planner/:recipe_id"
                        element={<MealPlanner/>}
                    />
                    <Route
                        path="/profile/:user_id"
                        element={<PublicProfilePage />}
                    />
                    <Route path="/edit-profile" element={<EditProfilePage />} />
                    <Route path="/saved-recipes" element={<SavedRecipe />} />
                    <Route path="/create-recipe" element={<CreateRecipe />} />
                    <Route
                        path="/reset/request"
                        element={<ResetRequestPage />}
                    />
                      <Route
                        path="/recipe/:recipe_id"
                        element={<RecipePage/>}
                    />
                    <Route
                        path="/reset/code"
                        element={<ResetCodePage />}
                    />
                    <Route
                        path="/reset/newpassword"
                        element={<ResetNewPasswordPage />}
                    />
                    <Route
                        path="/change/request"
                        element={<ChangeRequestPage />}
                    />
                    <Route

                        path="/change/code"
                        element={<ChangeCodePage />}
                    />
                    <Route
                        path="/change/newemail"
                        element={<ChangeNewEmailPage />}
                    />
                    <Route
                        exact
                        path="/"
                        element={<Home />}
                    />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/login"
                        element={<Login />}
                    />
                    <Route
                        path="/ingredientSearch"
                        element={<IngredientSearch />}
                    />
                    <Route
                        path="/settings"
                        element={<Settings />}
                    />
                    <Route
                        path="/profile"
                        element={<ProfilePage />}
                    />
                    <Route path="/explore" element={<Explore />}>
                        <Route index element={<DefaultExplore />} /> 
                        <Route path=":mealType" element={<MealPage />} /> 
                        <Route path="difficulty" element={<DifficultyPage />} /> 
                        <Route path="search/:recipe_name" element={<SearchResults />} /> 
                    </Route>
                    <Route
                        path="/delete_account"
                        element={<DeleteAccount />}
                    />
                    <Route
                        path="/trending_recipes"
                        element={<TrendingRecipesPage />}
                    />
                </Routes>
            </Router>
        </>
    );
}

export default App;