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

// Get the name from the request
if(isset($_GET['name'])){
$name = $_GET['name'];
}else{
    echo json_encode(["success" => false, "message"=> "Bad Request"]);
    exit();
}

if (empty($name)) {
    // If no name provided, return error
    echo json_encode(["success" => false, "message"=> "Please enter a search term"]);
    exit();
}


// Connect to the database
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

try{
// If name is provided, search for recipes with that name
$dietary = isset($_GET['dietary']) ? $_GET['dietary'] : 'none';

// Add dietary restriction filter if not 'none'
if ($dietary !== 'none') {
    $name = $name . "*";
    $stmt = $conn->prepare("SELECT id, name, image, steps, rating, diff FROM recipes WHERE MATCH(name,steps) AGAINST(? IN BOOLEAN MODE) AND dietary_restriction = ? LIMIT 20");
    $stmt->bind_param("ss", $name,$dietary);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $name = $name . "*";
    $stmt = $conn->prepare("SELECT id, name, image, steps, rating, diff FROM recipes WHERE MATCH(name,steps) AGAINST(? IN BOOLEAN MODE) LIMIT 20");
    $stmt->bind_param("s", $name);
    $stmt->execute();
    $result = $stmt->get_result();    
}

$recipes = [];
while ($row = $result->fetch_assoc()) {
    $recipes[] = $row;
}

$stmt->close();

if (empty($recipes)) {
    echo json_encode([
        "success" => false, 
        "message" => "No search results"
    ]);
    $conn->close();
    exit();
}

echo json_encode(["success" => true, "recipes" => $recipes]);

$stmt->close();
$conn->close();
} catch (mysqli_sql_exception $e) {
    echo json_encode(["success" => false, "status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>