<?php
// verify_delete_code.php

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

$codeInput = isset($_POST['code']) ? trim($_POST['code']) : "";

if (empty($codeInput)) {
    echo json_encode(["status" => "error", "message" => "Verification code is required."]);
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

$stmt = $conn->prepare("SELECT delete_code, delete_expiry FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Account not found."]);
    exit();
}

$row = $result->fetch_assoc();
$storedCode = $row['delete_code'];
$expiry = $row['delete_expiry'];

if ($storedCode == $codeInput && time() < $expiry) {
    echo json_encode(["status" => "success", "message" => "Code verified."]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid or expired code."]);
}
?>