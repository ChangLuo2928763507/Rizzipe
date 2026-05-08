<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

session_start();
require("./env.php");

// Check if user is logged in
if (!isset($_SESSION['craft_loggedin']) || $_SESSION['craft_loggedin'] !== true) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit();
}

$servername = constant("servername");
$username = constant("username");
$password = constant("password");
$dbname = constant("dbname");

$rawData = file_get_contents('php://input');
$data = json_decode($rawData, true);
if ($data === null || !isset($data['recipe_id'])) {
    echo json_encode(["success" => false, "message" => "Read"]);
    exit();
}

$recipe_id= $data['recipe_id'];
$user_id = $_SESSION["craft_user_id"];

try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    $conn->set_charset("utf8");

    // Check if recipe is already saved
    $stmt_check = $conn->prepare("SELECT id FROM saved_recipes WHERE user_id = ? AND recipe_id = ?");
    $stmt_check->bind_param("ii", $user_id, $recipe_id);
    $stmt_check->execute();
    $stmt_check->store_result();

    if ($stmt_check->num_rows > 0) {
        echo json_encode(["success" => true, "check_save" => true]);
    } else {
        echo json_encode(["success" => true, "check_save" => false,"message"=>"Unsaved".$user_id." ".$recipe_id]);
    }

    $stmt_check->close();
    $conn->close();
} catch (mysqli_sql_exception $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
