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

if (isset($_GET['user_id'])) {
    // Public profile view: Get recipes for the user whose ID is provided in the URL.
    $profileUserId = $_GET['user_id'];

    $conn = new mysqli($servername, $username, $password, $dbname);
    $conn->set_charset("utf8");

    try {
        // Query recipes created by the given user_id from the recipes table.
        $stmt = $conn->prepare("SELECT id, name, image, steps, diff, rating FROM recipes WHERE user_id = ?");
        $stmt->bind_param("i", $profileUserId);
        $stmt->execute();
        $result = $stmt->get_result();

        $recipes = [];
        while ($row = $result->fetch_assoc()) {
            $recipe_id = $row["id"];
            
            // For each recipe, get its ingredients.
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
        echo json_encode(["success" => false, "status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    // Logged-in user view: No user_id provided, so fetch recipes for the logged-in user.
    if (!isset($_SESSION['craft_loggedin']) || $_SESSION['craft_loggedin'] !== true) {
        echo json_encode(["success" => false, "message" => "User not logged in"]);
        exit();
    }

    $loggedInUserId = $_SESSION['craft_user_id'];

    try {
        $conn = new mysqli($servername, $username, $password, $dbname);
        $conn->set_charset("utf8");

        // Query recipes created by the logged-in user.
        $stmt = $conn->prepare("SELECT id, name, image, steps, diff, rating FROM recipes WHERE user_id = ?");
        $stmt->bind_param("i", $loggedInUserId);
        $stmt->execute();
        $result = $stmt->get_result();

        $recipes = [];
        while ($row = $result->fetch_assoc()) {
            $recipe_id = $row["id"];
            
            // For each recipe, get its ingredients.
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
        echo json_encode(["success" => false, "status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
}
?>
