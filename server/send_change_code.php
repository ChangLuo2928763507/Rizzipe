<?php
// send_change_code.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Database configuration
require("./env.php");
$servername = constant("servername");
$dbUsername = constant("username");
$dbPassword = constant("password");
$dbname = constant("dbname");

// Enable error reporting for MySQLi
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// Ensure the request method is POST
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


// Read JSON input
$email = $_POST["email"];

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Invalid email format."]);
    exit();
}

// Create a new database connection
$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbname);
$conn->set_charset("utf8");

// Check if the email exists in the users table
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Email not found."]);
    exit();
}

// Generate a confirmation code (6-digit random number)
$code = rand(100000, 999999);
// Set expiry time (e.g., code valid for 5 minutes)
$expiry = time() + 300;

// Update the user's record with the change code and expiry
$stmt = $conn->prepare("UPDATE users SET change_code = ?, change_expiry = ? WHERE email = ?");
$stmt->bind_param("sis", $code, $expiry, $email);
$stmt->execute();

// Send the code via email
$subject = "Email Change Confirmation Code";
$message = wordwrap("Your email change confirmation code is: " . $code, 70);
$headers = "From: cookcraft.noreply@gmail.com\r\n";

mail($email, $subject, $message, $headers);

// Return success response
echo json_encode(["status" => "success", "message" => "Confirmation code sent."]);
?>