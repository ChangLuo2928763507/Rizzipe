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

if ($conn->connect_error) {
    die(json_encode(['error' => 'Database connection failed']));
}

// Fetch the user's theme preference
$username = $_SESSION['craft_user_id']; // Replace with your session logic
$sql = "SELECT theme FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode(['theme' => $row['theme']]);
} else {
    echo json_encode(['theme' => 'light']); // Default theme
}

$stmt->close();
$conn->close();
?>