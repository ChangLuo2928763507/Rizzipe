<?php
// send_delete_code.php

header("Access-Control-Allow-Origin: *");
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


if (!isset($_SESSION['craft_loggedin']) || $_SESSION['craft_loggedin'] !== true) {
    echo json_encode(["status" => "error", "message" => "User not logged in."]);
    exit();
}

$email = isset($_SESSION['craft_email']) ? trim($_SESSION['craft_email']) : "";
if (empty($email)) {
    echo json_encode(["status" => "error", "message" => "User email not found in session."]);
    exit();
}

require("./env.php");
$servername = constant("servername");
$dbUsername = constant("username");
$dbPassword = constant("password");
$dbname     = constant("dbname");

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbname);
$conn->set_charset("utf8");

// Verify that the account exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Account not found."]);
    exit();
}

// Generate a 6 digit verification code and set expiry for 5 minutes
$code = rand(100000, 999999);
$expiry = time() + 300;

$stmt = $conn->prepare("UPDATE users SET delete_code = ?, delete_expiry = ? WHERE email = ?");
$stmt->bind_param("sis", $code, $expiry, $email);
$stmt->execute();

// Send the verification code via email using PHP's mail function
$subject = "Account Deletion Verification Code";
$message = "Your account deletion verification code is: $code";
$headers = "From: cookcraft.noreply@gmail.com\r\n";
mail($email, $subject, $message, $headers);

echo json_encode(["status" => "success", "message" => "Verification code sent."]);
?>