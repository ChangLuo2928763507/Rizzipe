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

// Get the tags from the request
$tags = isset($_GET['tags']) ? explode(',', $_GET['tags']) : [];
// Get dietary restriction from the request
$dietary = isset($_GET['dietary']) ? $_GET['dietary'] : 'none';

// Connect to the database
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

// Base query parts
$baseSelect = "SELECT id, name, image, steps, rating, diff FROM recipes";
$dietaryCondition = "";

// Add dietary restriction filter if not 'none'
if ($dietary !== 'none') {
    $dietaryCondition = " WHERE dietary_restriction = ?";
}

if (empty($tags)) {
    // If no tags provided, return all recipes (with optional dietary filter)
    $query = $baseSelect . $dietaryCondition;
    $stmt = $conn->prepare($query);
    
    // Bind dietary parameter if needed
    if ($dietary !== 'none') {
        $stmt->bind_param('s', $dietary);
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
            "rating" => $row["rating"],
            "diff" => $row["diff"]
        ];
    }
    
    echo json_encode(["success" => true, "recipes" => $recipes]);
    $stmt->close();
    $conn->close();
    exit();
}

// If tags are provided, search for recipes containing all tags
$placeholders = implode(',', array_fill(0, count($tags), '?'));

// First get recipe IDs that match all tags
$query = "SELECT recipe_id FROM ingredients 
          WHERE ingredient IN ($placeholders)
          GROUP BY recipe_id
          HAVING COUNT(DISTINCT ingredient) = ?";
          
$stmt = $conn->prepare($query);
$types = str_repeat('s', count($tags)) . 'i';
$params = array_merge($tags, [count($tags)]);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$recipeIds = [];
while ($row = $result->fetch_assoc()) {
    $recipeIds[] = $row["recipe_id"];
}

$stmt->close();

if (empty($recipeIds)) {
    echo json_encode([
        "success" => false, 
        "message" => "No recipes found containing all the selected ingredients"
    ]);
    $conn->close();
    exit();
}

// Fetch the complete recipe details with dietary restriction filter if needed
$recipeIdList = implode(',', $recipeIds);
$query = $baseSelect . " WHERE id IN ($recipeIdList)";

// Add dietary restriction filter if not 'none'
if ($dietary !== 'none') {
    $query .= " AND dietary_restriction = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('s', $dietary);
} else {
    $stmt = $conn->prepare($query);
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
        "rating" => $row["rating"],
        "diff" => $row["diff"]
    ];
}

if (count($recipes) > 0) {
    echo json_encode(["success" => true, "recipes" => $recipes]);
} else {
    echo json_encode([
        "success" => false, 
        "message" => "No recipes found matching your criteria"
    ]);
}

$stmt->close();
$conn->close();
?>

