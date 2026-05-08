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

if (isset($_GET['user_id'])) {
    // Public profile view
    $user_id = $_GET['user_id'];

    $stmt = $conn->prepare("SELECT username, bio, profile_picture, joined_date FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user) {
        echo json_encode([
            "success" => true,
            "username" => $user["username"],
            "bio" => $user["bio"],
            "image_url" => $user["profile_picture"],
            "joined_date" => $user["joined_date"]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "User not found"]);
    }

    $stmt->close();
    $conn->close();
} else {
    // Logged-in user profile view
    if (!isset($_SESSION['craft_loggedin']) || $_SESSION['craft_loggedin'] !== true) {
        echo json_encode(["success" => false, "message" => "User not logged in"]);
        exit();
    }
    
    $user_id = $_SESSION['craft_user_id'];
    
    $stmt = $conn->prepare("SELECT username, bio, profile_picture, joined_date FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if ($user) {
        echo json_encode(["success" => true, "username" => htmlspecialchars($user["username"], ENT_QUOTES), "bio" => $user["bio"], "image_url" => $user["profile_picture"], "joined_date" => $user["joined_date"]]);
    } else {
        echo json_encode(["success" => false, "message" => "No profile picture found"]);
    }
    
    $stmt->close();
    $conn->close();
}
?>
