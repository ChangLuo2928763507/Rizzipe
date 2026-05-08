<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");


session_start();
require("./env.php");

session_start();
if (!isset($_SESSION['csrf_token'])) {
    // Generate a secret token when needed on page & one has not yet existed
    $_SESSION['csrf_token']= bin2hex(random_bytes(16));
}
setcookie("csrf_token",$_SESSION["csrf_token"],[
    'path' => '/',
    'secure' => true, 
    'samesite' => 'Strict'
  ]);
 
$token =  $_POST["csrf_token"];
if (!$token || !hash_equals($_SESSION['csrf_token'],$token)) {
    echo json_encode(["status" => "error", "message" => "Bad Token".$token.$_POST["recipe_id"]]);
    exit();
}


$servername = constant("servername");
$username = constant("username");
$password = constant("password");
$dbname = constant("dbname");

// Check if user is logged in
if (!isset($_SESSION['craft_loggedin']) || $_SESSION['craft_loggedin'] !== true) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit();
}

$user_id = $_SESSION['craft_user_id'];
$recipe_id = $_POST["recipe_id"];

try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    $conn->set_charset("utf8");

    // Check if recipe is already saved
    $stmt_check = $conn->prepare("SELECT id FROM saved_recipes WHERE user_id = ? AND recipe_id = ?");
    $stmt_check->bind_param("ii", $user_id, $recipe_id);
    $stmt_check->execute();
    $stmt_check->store_result();

    if ($stmt_check->num_rows > 0) {
        // Recipe is already saved, so unsave it
        $stmt_unsave = $conn->prepare("DELETE FROM saved_recipes WHERE user_id = ? AND recipe_id = ?");
        $stmt_unsave->bind_param("ii", $user_id, $recipe_id);
        $stmt_unsave->execute();

        if ($stmt_unsave->affected_rows > 0) {
            echo json_encode(["success" => true, "message" => "Recipe unsaved"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to unsave recipe"]);
        }

        $stmt_unsave->close();
    } else {
        // Recipe is not saved, so save it
        $stmt_save = $conn->prepare("INSERT INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)");
        $stmt_save->bind_param("ii", $user_id, $recipe_id);
        $stmt_save->execute();

        if ($stmt_save->affected_rows > 0) {
            echo json_encode(["success" => true, "message" => "Recipe saved"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to save recipe"]);
        }

        $stmt_save->close();
    }

    $stmt_check->close();
    $conn->close();
} catch (mysqli_sql_exception $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>