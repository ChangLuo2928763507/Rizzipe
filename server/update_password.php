<?php
// update_password.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require("./env.php");

$servername = constant("servername");
$dbUsername = constant("username");
$dbPassword= constant("password");
$dbname = constant("dbname");


mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Only POST requests are allowed."]);
    exit();
}

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

$email= isset($_POST["email"]) ? $_POST["email"] : "";
$newPassword = isset($_POST["password"]) ? $_POST["password"] : "";

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Invalid email format."]);
    exit();
}

// Validate password strength (minimum 8 characters, at least one uppercase letter, one lowercase letter, one digit, and one special character)
if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/', $newPassword)) {
    echo json_encode([
        "status" => "error",
        "message" => "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    ]);
    exit();
}

$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbname);
$conn->set_charset("utf8");

// Hash the new password using bcrypt
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

// Update the user's password and clear the reset code and expiry fields
$stmt = $conn->prepare("UPDATE users SET password = ?, reset_code = NULL, reset_expiry = NULL WHERE email = ?");
$stmt->bind_param("ss", $hashedPassword, $email);
$stmt->execute();

echo json_encode(["status" => "success", "message" => "Password updated successfully."]);
?>
