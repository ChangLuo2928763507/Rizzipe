<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
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

// Connect to the database
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

// Fetch all unique ingredient tags using ingredient
$stmt = $conn->prepare("SELECT DISTINCT ingredient FROM ingredients");
$stmt->execute();
$result = $stmt->get_result();

$tags = [];
while ($row = $result->fetch_assoc()) {
    $tags[] = $row["ingredient"];
}

// Also fetch available dietary restrictions
$stmt = $conn->prepare("SELECT DISTINCT dietary_restriction FROM recipes WHERE dietary_restriction IS NOT NULL");
$stmt->execute();
$result = $stmt->get_result();

$dietaryOptions = [];
while ($row = $result->fetch_assoc()) {
    if (!empty($row["dietary_restriction"])) {
        $dietaryOptions[] = $row["dietary_restriction"];
    }
}

if (count($tags) > 0) {
    echo json_encode([
        "success" => true, 
        "tags" => $tags,
        "dietaryOptions" => $dietaryOptions
    ]);
} else {
    echo json_encode(["success" => false, "message" => "No tags found"]);
}

$stmt->close();
$conn->close();
?>