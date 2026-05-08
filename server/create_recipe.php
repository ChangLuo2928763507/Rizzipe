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

if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(16));
}
setcookie("csrf_token", $_SESSION["csrf_token"], [
    'path' => '/',
    'secure' => true,
    'samesite' => 'Strict'
]);

$token = $_POST["csrf_token"];

if (!$token || !hash_equals($_SESSION['csrf_token'], $token)) {
    echo json_encode(["status" => "error", "message" => "Bad Token"]);
    exit();
}

if (!isset($_SESSION['craft_loggedin']) || $_SESSION['craft_loggedin'] !== true) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit();
}

try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    $conn->set_charset("utf8");

    if (
        !isset($_POST["recipe_name"], $_POST["ingredients"], $_POST["quantities"], $_POST["instructions"], $_POST["difficulty"], $_POST["category"]) ||
        !isset($_FILES["recipe_image"])
    ) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit();
    }

    if(strlen($_POST['recipe_name']) > 50){
        echo json_encode(["success" => false, "message" => "Recipe name over character limit"]);
        exit();
    }
    if(strlen($_POST['quantities']) > 500){
        echo json_encode(["success" => false, "message" => "Quantities list over character limit"]);
        exit();
    }
    if(strlen($_POST['ingredients']) > 500){
        echo json_encode(["success" => false, "message" => "Ingredients list over character limit"]);
        exit();
    }
    if(strlen($_POST['instructions']) > 2000){
        echo json_encode(["success" => false, "message" => "Instructions over character limit"]);
        exit();
    }

    $recipe_name = trim(htmlspecialchars($_POST["recipe_name"], ENT_QUOTES));
    $ingredients = trim($_POST["ingredients"]);
    $quantities = trim($_POST["quantities"]);
    $instructions = trim(htmlspecialchars($_POST["instructions"], ENT_QUOTES));
    $difficulty = intval($_POST["difficulty"]);
    $category = trim(htmlspecialchars($_POST["category"], ENT_QUOTES));
    // Get dietary restriction value
    $dietary_restriction = isset($_POST["dietary_restriction"]) ? trim(htmlspecialchars($_POST["dietary_restriction"], ENT_QUOTES)) : null;
    $valid_restrictions = ["keto", "vegan", "vegetarian"];
    if ($dietary_restriction !== null && !in_array($dietary_restriction, $valid_restrictions)) {
        $dietary_restriction = null; // Default to NULL if invalid value
    }
    $user_id = $_SESSION['craft_user_id'];

    if($difficulty < 1 || $difficulty > 5){
        echo json_encode(["success" => false, "message" => "Invalid difficulty"]);
        exit();
    }

    if (empty($category)) {
        echo json_encode(["success" => false, "message" => "Category is required"]);
        exit();
    }

    $ingredient_list = explode(",", $ingredients);
    $quantity_list = explode(",", $quantities);

    if (count($ingredient_list) !== count($quantity_list)) {
        echo json_encode(["success" => false, "message" => "Mismatch between ingredients and quantities"]);
        exit();
    }

    // Process optional nutritional values
    $nutrition_fields = [
        'calories',
        'total_fat',
        'cholesterol',
        'total_carbohydrates',
        'sugars',
        'protein'
    ];
    $nutrition = [];
    foreach ($nutrition_fields as $field) {
        if (isset($_POST[$field]) && $_POST[$field] !== '') {
            if (strlen($_POST[$field]) > 20) {
                echo json_encode(["success" => false, "message" => ucfirst(str_replace("_", " ", $field)) . " value over character limit"]);
                exit();
            }
            $nutrition[$field] = floatval($_POST[$field]);
        }
    }
    $nutrition_json = json_encode($nutrition);

    // Handle image upload
    $target_dir = __DIR__ . "/../uploads/";
    $image_name = basename($_FILES["recipe_image"]["name"]);
    $file_name = uniqid() . "_" . $image_name;
    $target_file = $target_dir . $file_name;
    $image_url = "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/uploads/" . $file_name;

    if (!move_uploaded_file($_FILES["recipe_image"]["tmp_name"], $target_file)) {
        echo json_encode(["success" => false, "message" => "Error uploading image"]);
        exit();
    }

    // Insert recipe including the nutrition JSON and dietary restriction
    if ($dietary_restriction === null) {
        $stmt = $conn->prepare("INSERT INTO recipes (name, image, steps, diff, category, user_id, nutrition) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssisis", $recipe_name, $image_url, $instructions, $difficulty, $category, $user_id, $nutrition_json);
    } else {
        $stmt = $conn->prepare("INSERT INTO recipes (name, image, steps, diff, category, user_id, nutrition, dietary_restriction) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssisiss", $recipe_name, $image_url, $instructions, $difficulty, $category, $user_id, $nutrition_json, $dietary_restriction);
    }
    $stmt->execute();
    $recipe_id = $stmt->insert_id;
    $stmt->close();

    // Insert ingredients
    for ($i = 0; $i < count($ingredient_list); $i++) {
        $ingredient = trim(htmlspecialchars($ingredient_list[$i], ENT_QUOTES));
        $quantity = trim(htmlspecialchars($quantity_list[$i], ENT_QUOTES));
        if($ingredient == ""){
            echo json_encode(["success" => false, "message" => "Cannot have blank ingredient"]);
            $stmt = $conn->prepare("DELETE FROM recipes WHERE id = ? AND user_id = ?");
            $stmt->bind_param("ii", $recipe_id, $user_id);
            $stmt->execute();
            $stmt = $conn->prepare("DELETE FROM ingredients WHERE recipe_id = ?");
            $stmt->bind_param("i", $recipe_id);
            $stmt->execute();
            exit();
        }
        if($quantity == ""){
            echo json_encode(["success" => false, "message" => "Cannot have blank quantity"]);
            $stmt = $conn->prepare("DELETE FROM recipes WHERE id = ? AND user_id = ?");
            $stmt->bind_param("ii", $recipe_id, $user_id);
            $stmt->execute();
            $stmt = $conn->prepare("DELETE FROM ingredients WHERE recipe_id = ?");
            $stmt->bind_param("i", $recipe_id);
            $stmt->execute();
            exit();
        }
        $stmt = $conn->prepare("INSERT INTO ingredients (recipe_id, ingredient, qty) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $recipe_id, $ingredient, $quantity);
        $stmt->execute();
    }

    echo json_encode(["success" => true, "message" => "Recipe Created Successfully!", "recipe_id" => $recipe_id]);
    $conn->close();
} catch (mysqli_sql_exception $e) {
    echo json_encode(["success" => false, "status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>
