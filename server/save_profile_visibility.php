<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Database connection
require("./env.php");

$host = constant("servername");
$user  = constant("username");
$pass = constant("password");
$db  = constant("dbname");
$conn = new mysqli($host, $user, $pass, $db);

session_start();
try {
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
    echo json_encode(["status" => "error", "message" => "Bad Token".$token."a"]);
    exit();
}

if ($conn->connect_error) {
    die(json_encode(['error' => 'Database connection failed']));
}

// Get the new visibility preference
$isPublic =  (int)$_POST["isPublic"];
$username = $_SESSION['craft_user_id']; // Replace with your session logic

// Update the user's profile visibility
$sql = "UPDATE users SET is_public = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('is', $isPublic, $username);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to update profile visibility']);
}

$stmt->close();
$conn->close();
} catch(Exception $e){
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>