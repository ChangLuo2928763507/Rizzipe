<?php
// verify_reset_code.php

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

$email = isset($_POST['email']) ? trim($_POST['email']) : "";
$code  = isset($_POST['code'])  ? trim($_POST['code'])  : "";

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Invalid email format."]);
    exit();
}

if (empty($code)) {
    echo json_encode(["status" => "error", "message" => "Confirmation code is required."]);
    exit();
}

$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbname);
$conn->set_charset("utf8");

$stmt = $conn->prepare("SELECT reset_code, reset_expiry FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Email not found."]);
    exit();
}

$row = $result->fetch_assoc();
$storedCode = $row['reset_code'];
$expiry     = $row['reset_expiry'];

// Verify the confirmation code and check expiry
if ($storedCode == $code && time() < $expiry) {
    echo json_encode(["status" => "success", "message" => "Code verified."]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid or expired code."]);
}
?>
