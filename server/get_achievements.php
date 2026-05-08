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

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

function getAchievements($conn, $user_id) {
    // Initialize achievements
    $achievements = [
        "created_first_recipe" => false,
        "added_bio" => false,
        "created_10_recipes" => false,
        "left_review" => false,
        "left_10_reviews" => false
    ];

    // Check if user has bio
    $stmt = $conn->prepare("SELECT bio FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($bio);
    if ($stmt->fetch() && !empty(trim($bio))) {
        $achievements["added_bio"] = true;
    }
    $stmt->close();

    // Check number of recipes
    $stmt = $conn->prepare("SELECT COUNT(*) FROM recipes WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($recipe_count);
    $stmt->fetch();
    if ($recipe_count >= 1) {
        $achievements["created_first_recipe"] = true;
    }
    if ($recipe_count >= 10) {
        $achievements["created_10_recipes"] = true;
    }
    $stmt->close();

    // Check number of reviews
    $stmt = $conn->prepare("SELECT COUNT(*) FROM reviews WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($review_count);
    $stmt->fetch();
    if ($review_count >= 1) {
        $achievements["left_review"] = true;
    }
    if ($review_count >= 10) {
        $achievements["left_10_reviews"] = true;
    }
    $stmt->close();

    return $achievements;
}

if (isset($_GET['user_id'])) {
    // Public profile view
    $user_id = $_GET['user_id'];
    $achievements = getAchievements($conn, $user_id);
    echo json_encode(["success" => true, "achievements" => $achievements]);
} else {
    // Logged-in user view
    if (!isset($_SESSION['craft_loggedin']) || $_SESSION['craft_loggedin'] !== true) {
        echo json_encode(["success" => false, "message" => "User not logged in"]);
        exit();
    }
    $user_id = $_SESSION['craft_user_id'];
    $achievements = getAchievements($conn, $user_id);
    echo json_encode(["success" => true, "achievements" => $achievements]);
}

$conn->close();
?>