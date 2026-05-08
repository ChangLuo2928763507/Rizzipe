<?php
// allows CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, DELETE");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");
header('Access-Control-Allow-Credentials: true');

session_start();
if (!isset($_SESSION["csrf_token"])) {
    // Generate a secret token when needed on page & one has not been generated
    $_SESSION['csrf_token']= bin2hex(random_bytes(16));
}
setcookie("csrf_token",$_SESSION["csrf_token"],[
    'path' => '/',
    'secure' => true, 
    'samesite' => 'Strict'
  ]);
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_SESSION['craft_loggedin']) && $_SESSION['craft_loggedin'] === true) {
        echo json_encode([
            "status" => "Success",
            "message" => "logged in",
            "email" => $_SESSION['craft_email'],  // Use the email stored in session
            "id" => $_SESSION['craft_user_id'],   // Use the ID stored in session
	        "username" => $_SESSION['craft_username'] ?? "Anonymous"
        ]);
    } else {
        echo json_encode(["status" => "Error", "message" => "not logged in"]);
    }
} else {
    session_unset();
    session_destroy();
    
    echo json_encode(["status" => "Success", "message" => "Logged out"]);
}
?>
