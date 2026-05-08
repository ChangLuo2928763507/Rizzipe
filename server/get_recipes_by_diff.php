<?php
// 允许跨域访问
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require("./env.php");

$servername = constant("servername");
$username = constant("username");
$password = constant("password");
$dbname = constant("dbname");

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    $conn->set_charset("utf8");

    $difficulty = isset($_GET['diff']) ? intval($_GET['diff']) : 1;
    
    // Get dietary restriction parameter
    $dietary = isset($_GET['dietary']) ? $_GET['dietary'] : 'none';

    // Base query - Updated to explicitly include diff field
    $query = "SELECT id, name, image, steps, rating, diff FROM recipes WHERE diff = ?";
    
    // Add dietary restriction filter if not 'none'
    if ($dietary !== 'none') {
        $query .= " AND dietary_restriction = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("is", $difficulty, $dietary);
    } else {
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $difficulty);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();

    $recipes = [];
    while ($row = $result->fetch_assoc()) {
        $recipes[] = $row;
    }

    echo json_encode($recipes);

} catch (mysqli_sql_exception $e) {
    echo json_encode(["status" => "Error", "message" => "Database error: " . $e->getMessage()]);
}
?>

