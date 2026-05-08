<?php
// update_email.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require("./env.php");
$servername = constant("servername");
$dbUsername = constant("username");
$dbPassword = constant("password");
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

$oldEmail = $_POST["oldEmail"];
$newEmail = $_POST["newEmail"];

// Validate emails
if (!filter_var($oldEmail, FILTER_VALIDATE_EMAIL) || !filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Invalid email format."]);
    exit();
}

$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbname);
$conn->set_charset("utf8");

// Check if the new email is already in use
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $newEmail);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "The new email is already in use."]);
    exit();
}

// Update the user's email and clear the change code and expiry fields
$stmt = $conn->prepare("UPDATE users SET email = ?, change_code = NULL, change_expiry = NULL WHERE email = ?");
$stmt->bind_param("ss", $newEmail, $oldEmail);
$stmt->execute();

echo json_encode(["status" => "success", "message" => "Email updated successfully."]);
?>