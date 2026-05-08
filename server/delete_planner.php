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

// Check if user is logged in
if (!isset($_SESSION['craft_loggedin']) || $_SESSION['craft_loggedin'] !== true) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit();
}

$recipe_id= $_POST["recipe_id"];
$year= $_POST["year"];
$month= $_POST["month"];
$day= $_POST["day"];
$meal =$_POST["meal"];
$user_id = $_SESSION['craft_user_id'];

try{
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

//check if user and recipe exists

$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
//If no email is found, throw error
if(mysqli_num_rows($result) ==0){
    echo json_encode(["success" => false, "message" => "Invalid user"]);
    exit();
}

$stmt = $conn->prepare("SELECT * FROM recipes WHERE id = ?");
$stmt->bind_param("i", $recipe_id);
$stmt->execute();
$result = $stmt->get_result();
//If no recipe is found, throw error
if(mysqli_num_rows($result) ==0){
    echo json_encode(["success" => false, "message" => "Invalid recipe".$recipe_id."a"]);
    exit();
}

$stmt = $conn->prepare("SELECT * FROM planner WHERE user_id = ? AND recipe_id = ? AND year = ? AND month = ? AND day = ? AND meal = ?");
$stmt->bind_param("iiiiis", $user_id,$recipe_id,$year,$month,$day,$meal);
$stmt->execute();
$result = $stmt->get_result();
//If recipe found, update
if(mysqli_num_rows($result) !=0){
    $stmt = $conn->prepare("DELETE FROM planner WHERE user_id = ? AND recipe_id = ? AND year = ? AND month = ? AND day = ? AND meal = ?");
    $stmt->bind_param("iiiiis", $user_id,$recipe_id,$year,$month,$day,$meal);
    $stmt->execute();
    echo json_encode(["success" => true, "message" => "Planner Entry Deleted"]);
    exit();
} else{
    echo json_encode(["success" => false, "message" => "No Entry Found"]);
    exit();
}

$stmt->close();
$conn->close();

}catch (mysqli_sql_exception $e) {
    // check repeat email
        echo json_encode(["success"=>false,"status" => "error", "message" => "Database error: " . $e->getMessage()]);

}
?>
