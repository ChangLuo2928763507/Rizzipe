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

try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    $conn->set_charset("utf8");

    $user_id = $_SESSION['craft_user_id'];

    // Get saved recipes for the user
    $stmt = $conn->prepare("
        SELECT r.id, r.name, r.image, r.steps, r.diff, r.rating 
        FROM saved_recipes sr
        JOIN recipes r ON sr.recipe_id = r.id
        WHERE sr.user_id = ?
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $recipes = [];
    while ($row = $result->fetch_assoc()) {
        $recipe_id = $row["id"];

        // Get ingredients for each recipe
        $stmt_ingredients = $conn->prepare("SELECT ingredient FROM ingredients WHERE recipe_id = ?");
        $stmt_ingredients->bind_param("i", $recipe_id);
        $stmt_ingredients->execute();
        $result_ingredients = $stmt_ingredients->get_result();
        $ingredients = [];

        foreach ($result_ingredients as $ingredient_row) {
            array_push($ingredients, $ingredient_row["ingredient"]);
        }

        $row["ingredients"] = $ingredients;
        $recipes[] = $row;

        $stmt_ingredients->close();
    }

    echo json_encode(["success" => true, "recipes" => $recipes]);

    $stmt->close();
    $conn->close();
} catch (mysqli_sql_exception $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>