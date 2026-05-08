<?php
// Allows CORS and specifies JSON response
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Database configuration
require("./env.php");
$servername = constant("servername");
$username = constant("username");
$password = constant("password");
$dbname = constant("dbname");

// Enable MySQLi error reporting for exceptions
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    // Create a new database connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    $conn->set_charset("utf8");

    // Query to fetch a random recipe - Updated to include steps field
    $stmt = $conn->prepare("SELECT id, name, image, steps, diff, rating FROM recipes ORDER BY RAND() LIMIT 1");
    $stmt->execute();
    $result = $stmt->get_result();

    // If a recipe is found, return it
    if ($result->num_rows > 0) {
        $recipe = $result->fetch_assoc();
        echo json_encode(["success" => true, "recipe" => $recipe]);
    } else {
        echo json_encode(["success" => false, "message" => "No recipes found."]);
    }
} catch (mysqli_sql_exception $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
