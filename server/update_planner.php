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
    echo json_encode(["success" => false, "message" => "Bad Token"]);
    exit();
}

$recipe_id= $_POST['recipe_id'];
$year= $_POST['year'];
$month= $_POST['month'];
$day= $_POST['day'];
$meal = $_POST['meal'];
$user_id = $_SESSION['craft_user_id'];

try{
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");
$stmt = $conn->prepare("SELECT * FROM recipes WHERE id = ?");
$stmt->bind_param("i", $recipe_id);
$stmt->execute();
$result = $stmt->get_result();
//If no recipe is found, throw error
if(mysqli_num_rows($result) ==0){
    echo json_encode(["success" => false, "message" => "Invalid recipe"]);
    exit();
}

$stmt = $conn->prepare("SELECT * FROM planner WHERE user_id = ? AND recipe_id = ? AND year = ? AND month = ? AND day = ? AND meal = ?");
$stmt->bind_param("iiiiis", $user_id,$recipe_id,$year,$month,$day,$meal);
$stmt->execute();
$result = $stmt->get_result();
//If entry found, throw error
if(mysqli_num_rows($result) !=0){
    echo json_encode(["success" => false, "message" => "Entry already made"]);
    exit();
}

$stmt = $conn->prepare("INSERT INTO planner (user_id,recipe_id,year,month,day,meal) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("iiiiis", $user_id, $recipe_id, $year,$month,$day,$meal);
$stmt->execute();


echo json_encode(["success" => true,"message" => "Planner updated"]);


$stmt->close();
$conn->close();

}catch (Exception $e) {
    // check repeat email
        echo json_encode(["success"=>false,"status" => "error", "message" => "Database error: " . $e->getMessage()]);

}
?>
