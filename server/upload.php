<?php
// Allows CORS
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
    echo json_encode(["status" => "error", "message" => "Bad Token"]);
    exit();
}

$user_id = $_SESSION['craft_user_id'];

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_FILES["profile_picture"])) {

    $target_dir = __DIR__ . "/../uploads/";  // Keep it in the root directory

    // Check if the directory exists and create if not

    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0777, true); // Create directory if it doesn't exist
    }


    // Sanitize and create a unique file name
    $file_name = preg_replace("/[^a-zA-Z0-9\-_\.]/", "", basename($_FILES["profile_picture"]["name"]));
    $file_extension = pathinfo($file_name, PATHINFO_EXTENSION);
    $new_file_name = "profile_" . $user_id .uniqid(). "." . $file_extension;
    $target_file = $target_dir . $new_file_name;

    // Check for any upload errors
    if ($_FILES["profile_picture"]["error"] !== UPLOAD_ERR_OK) {
        echo json_encode(["success" => false, "message" => "Error uploading file: " . $_FILES["profile_picture"]["error"]]);
        exit();
    }

    // Move the uploaded file to the target directory
    if (move_uploaded_file($_FILES["profile_picture"]["tmp_name"], $target_file)) {
        // Construct the full URL to the image
        $image_url = "https://se-dev.cse.buffalo.edu/CSE442/2025-Spring/cse-442ae/uploads/" . $new_file_name;

        // Store the file path in the database
        $stmt = $conn->prepare("UPDATE users SET profile_picture = ? WHERE id = ?");
        $stmt->bind_param("si", $image_url, $user_id);
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "image_url" => $image_url]);

        } else {
            echo json_encode(["success" => false, "message" => "Database update failed"]);
        }
        $stmt->close();
    } else {
        echo json_encode(["success" => false, "message" => "File upload failed"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
}

$conn->close();
?>