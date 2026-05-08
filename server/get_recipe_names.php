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
try {

// Fetch all unique ingredient tags using ingredient
$stmt = $conn->prepare("SELECT DISTINCT name FROM recipes");
$stmt->execute();
$result = $stmt->get_result();

$names = [];
while ($row = $result->fetch_assoc()) {
    $names[] = $row["name"];
}

if (count($names) > 0) {
    echo json_encode(["success" => true,"message"=>"Name lookup successful", "names" => $names]);
} else {
    echo json_encode(["success" => false, "message" => "No recipes found"]);
}

$stmt->close();
$conn->close();
} catch (mysqli_sql_exception $e) {
    echo json_encode(["success" => false, "status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>