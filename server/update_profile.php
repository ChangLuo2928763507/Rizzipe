<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

session_start();
require("./env.php");

$servername = constant("servername");
$username = constant("username");
$password = constant("password");
$dbname = constant("dbname");

// Check if user is logged in
if (!isset($_SESSION['craft_loggedin']) || $_SESSION['craft_loggedin'] !== true) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit();
}

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

$user_id = $_SESSION['craft_user_id'];

$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

if(strlen($_POST['bio'])>200){
    echo json_encode(["success" => false, "message" => "Bio over character limit"]);
    exit();
}

$username = trim($_POST["username"]);
$bio = trim(htmlspecialchars($_POST["bio"], ENT_QUOTES));

if ($username === "" || $bio === "") {
    echo json_encode(["success" => false, "message" => "Fields cannot be empty"]);
    exit();
}

$stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $userdata = $result->fetch_assoc();

    //Username taken
    if(mysqli_num_rows($result) !=0 && ($userdata["id"]!=$user_id)){
        echo json_encode(["success" => false, "message" => "Username taken. Please choose another one."]);
    exit();
    }

$stmt = $conn->prepare("UPDATE users SET username = ?, bio = ? WHERE id = ?");
$stmt->bind_param("ssi", $username, $bio, $user_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Profile updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Database update failed"]);
}

$stmt->close();
$conn->close();
?>