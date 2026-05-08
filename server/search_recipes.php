<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
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

// Get the search query from the request
$searchQuery = isset($_GET['query']) ? trim($_GET['query']) : '';

// Connect to the database
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

// Prepare the SQL query
if (empty($searchQuery)) {
    // If no search query, fetch all recipes
    $stmt = $conn->prepare("SELECT id, name, image, steps, rating FROM recipes");
} else {
    // If search query is provided, fetch matching recipes based on ingredients
    // Step 1: Find recipe_ids from the ingredients table
    $ingredientStmt = $conn->prepare("SELECT DISTINCT recipe_id FROM ingredients WHERE ingredient LIKE ?");
    $searchParam = "%" . $searchQuery . "%";
    $ingredientStmt->bind_param("s", $searchParam);
    $ingredientStmt->execute();
    $ingredientResult = $ingredientStmt->get_result();

    $recipeIds = [];
    while ($row = $ingredientResult->fetch_assoc()) {
        $recipeIds[] = $row["recipe_id"];
    }

    $ingredientStmt->close();

    if (empty($recipeIds)) {
        // No recipes found for the ingredient
        echo json_encode(["success" => false, "message" => "No recipes found for the ingredient"]);
        $conn->close();
        exit();
    }

    // Step 2: Fetch recipes using the recipe_ids
    $recipeIdList = implode(",", $recipeIds);
    $stmt = $conn->prepare("SELECT id, name, image, steps, rating FROM recipes WHERE id IN ($recipeIdList)");
}

$stmt->execute();
$result = $stmt->get_result();

$recipes = [];
while ($row = $result->fetch_assoc()) {
    $recipes[] = [
        "id" => $row["id"],
        "name" => $row["name"],
        "image" => $row["image"],
        "steps" => $row["steps"],
        "rating" => $row["rating"]
    ];
}

if (count($recipes) > 0) {
    echo json_encode(["success" => true, "recipes" => $recipes]);
} else {
    echo json_encode(["success" => false, "message" => "No recipes found"]);
}

$stmt->close();
$conn->close();
?>