<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");



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
    echo json_encode(["status" => "error", "message" => "Bad Token"]);
    exit();
}

if ($conn->connect_error) {
    die(json_encode(['error' => 'Database connection failed']));
}
// Suppress warnings and errors
error_reporting(0);
ini_set('display_errors', 0);

// Get the raw input data
$theme = $_POST["theme"];
$username = $_SESSION['craft_user_id']; 

// Database connection
require("./env.php");

$host = constant("servername");
$user  = constant("username");
$pass = constant("password");
$db  = constant("dbname");

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Database connection failed']));
}


// Update the user's theme preference
$sql = "UPDATE users SET theme = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ss', $theme, $username);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to update theme']);
}

$stmt->close();
$conn->close();
?>