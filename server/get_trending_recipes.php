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

// Get dietary restriction from the request
$dietary = isset($_GET['dietary']) ? $_GET['dietary'] : 'none';

// Connect to the database
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

// Base query to get recipes ordered by review count (including recipes with no reviews)
$baseQuery = "
    SELECT 
        r.id, 
        r.name, 
        r.image, 
        r.steps, 
        r.rating, 
        r.diff,
        COUNT(rev.rec_id) as review_count
    FROM 
        recipes r
    LEFT JOIN 
        reviews rev ON r.id = rev.rec_id
";

// Add dietary restriction filter if not 'none'
if ($dietary !== 'none') {
    $baseQuery .= " WHERE r.dietary_restriction = ?";
}

// Complete the query with GROUP BY and ORDER BY
$baseQuery .= "
    GROUP BY 
        r.id
    ORDER BY 
        review_count DESC,
        r.id ASC
";

// Prepare and execute the query
if ($dietary !== 'none') {
    $stmt = $conn->prepare($baseQuery);
    $stmt->bind_param("s", $dietary);
} else {
    $stmt = $conn->prepare($baseQuery);
}

$stmt->execute();
$result = $stmt->get_result();

$recipes = [];
while ($row = $result->fetch_assoc()) {
    $recipes[] = [
        "id" => $row["id"],
        "name" => $row["name"],
        "image" => $row["image"],
        "steps" => $row["steps"],
        "rating" => $row["rating"],
        "diff" => $row["diff"],
        "review_count" => $row["review_count"] // Optional: include if you want to display review count
    ];
}

echo json_encode(["success" => true, "recipes" => $recipes]);

$stmt->close();
$conn->close();
?>

