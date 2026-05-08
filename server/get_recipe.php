<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

session_start();
require("./env.php");

$servername = constant("servername");
$username = constant("username");
$password = constant("password");
$dbname = constant("dbname");

// Check if user is logged in
if (!isset($_SESSION['craft_loggedin']) || $_SESSION['craft_loggedin'] !== true) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit();
}

// Get recipe_id from input
$rawData = file_get_contents('php://input');
$data = json_decode($rawData, true);
if ($data === null || !isset($data['recipe_id'])) {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
    exit();
}

$recipe_id = $data['recipe_id'];

try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    $conn->set_charset("utf8");

    // Get recipe data, including the nutrition JSON and image URL
    $stmt = $conn->prepare("SELECT name, image, steps, rating, diff, user_id, nutrition FROM recipes WHERE id = ?");
    $stmt->bind_param("i", $recipe_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $recipe = $result->fetch_assoc();
    
    if (!$recipe) {
        echo json_encode(["success" => false, "message" => "No recipe found"]);
        exit();
    }
    
    // Determine if the logged-in user is the author
    $isAuthor = "NOTAuthor";
    if ($recipe["user_id"] == $_SESSION["craft_user_id"]) {
        $isAuthor = "isAuthor";
    }
    
    // Get ingredients for the recipe
    $stmt = $conn->prepare("SELECT ingredient, qty FROM ingredients WHERE recipe_id = ?");
    $stmt->bind_param("i", $recipe_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $ingredients = [];
    foreach ($result as $row) {
        $ingredients[] = $row["qty"] . " " . $row["ingredient"];
    }
    
    // Get username and profile picture of the recipe author
    $stmt = $conn->prepare("SELECT username, profile_picture FROM users WHERE id = ?");
    $stmt->bind_param("i", $recipe["user_id"]);
    $stmt->execute();
    $result = $stmt->get_result();
    $userdata = $result->fetch_assoc();
    $author = "Account Deleted";
    $profile_picture = "";
    if (mysqli_num_rows($result) == 1) {
        $author = htmlspecialchars($userdata["username"], ENT_QUOTES);
        $profile_picture = $userdata["profile_picture"];
    }
    
    // Decode the nutrition JSON to extract individual nutrient values
    $nutritionData = json_decode($recipe["nutrition"], true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        $nutritionData = [];
    }
    
    // Prepare individual nutrient values (or null if not provided)
    $calories = isset($nutritionData['calories']) ? $nutritionData['calories'] : null;
    $total_fat = isset($nutritionData['total_fat']) ? $nutritionData['total_fat'] : null;
    $cholesterol = isset($nutritionData['cholesterol']) ? $nutritionData['cholesterol'] : null;
    $total_carbohydrates = isset($nutritionData['total_carbohydrates']) ? $nutritionData['total_carbohydrates'] : null;
    $sugars = isset($nutritionData['sugars']) ? $nutritionData['sugars'] : null;
    $protein = isset($nutritionData['protein']) ? $nutritionData['protein'] : null;
    
    // Return the JSON response with all recipe data
    echo json_encode([
        "success" => true,
        "name" => $recipe["name"],
        "author" => $author,
        "author_id" => $recipe["user_id"],
        "profile_picture" => $profile_picture,
        "image_url" => $recipe["image"],
        "steps" => $recipe["steps"],
        "rating" => $recipe["rating"],
        "diff" => $recipe["diff"],
        "ingredients" => json_encode($ingredients),
        "isAuthor" => $isAuthor,
        "calories" => $calories,
        "total_fat" => $total_fat,
        "cholesterol" => $cholesterol,
        "total_carbohydrates" => $total_carbohydrates,
        "sugars" => $sugars,
        "protein" => $protein
    ]);
    
    $stmt->close();
    $conn->close();
    
} catch (mysqli_sql_exception $e) {
    echo json_encode(["success" => false, "status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
