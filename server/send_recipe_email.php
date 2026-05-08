<?php
session_start();
require_once("env.php");

header("Content-Type: application/json");

// Only allow POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Only POST requests are allowed."]);
    exit();
}

// Check CSRF token
if (!isset($_POST["csrf_token"]) || !hash_equals($_SESSION["csrf_token"], $_POST["csrf_token"])) {
    echo json_encode(["status" => "error", "message" => "Invalid CSRF token"]);
    exit();
}

// Get and validate email
$email = $_POST["email"] ?? "";
$link = $_POST["link"] ?? "";
$name = $_POST["name"] ?? "a recipe";
$shared_by = $_POST["shared_by"] ?? "someone";


if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Invalid email format"]);
    exit();
}

// Prepare message — 
$subject = "CookCraft Recipe Share";
$message = "
<html>
<head>
  <style>
    .container {
      font-family: Arial, sans-serif;
      padding: 20px;
      background-color: #fff8e7;
      border: 1px solid #ffc070;
      border-radius: 10px;
      color: #333;
    }
    .title {
      font-size: 22px;
      font-weight: bold;
      color: #ff9800;
      margin-bottom: 15px;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #ffc070;
      color: black;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin-top: 10px;
    }
    .footer {
      margin-top: 20px;
      font-size: 14px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class='container'>
    <div class='title'>A recipe has been shared with you</div>
    <p><strong>Recipe Name:</strong> {$name}</p>
    <p><strong>Shared by:</strong> {$shared_by}</p>
    <p>You can view it by clicking the button below:</p>
    <a href='{$link}' class='button'>View Recipe</a>
    <div class='footer'>Sent via CookCraft</div>
  </div>
</body>
</html>
";

// Set headers for HTML email
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: cookcraft.noreply@gmail.com\r\n";

// Send mail
if (mail($email, $subject, $message, $headers)) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to send email"]);
}
?>
