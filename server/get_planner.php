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

//Get recipe_id, reused from save_theme
$rawData = file_get_contents('php://input');
$data = json_decode($rawData, true);
if ($data === null ) {
    echo json_encode(["success" => false, "message" => "Read"]);
    exit();
}

$year= $data['year'];
$month= $data['month'];
$day= $data['day'];
$user_id = $_SESSION['craft_user_id'];

try{
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

//Get recipe data
$times =["Breakfast"=>[],"Lunch"=>[],"Dinner"=>[],"Dessert"=>[],"Snack"=>[]];

$stmt = $conn->prepare("SELECT recipe_id,meal FROM planner WHERE year = ? AND month = ? and day = ? AND user_id = ?");
$stmt->bind_param("iiii", $year,$month,$day,$user_id);
$stmt->execute();
$result = $stmt->get_result();

    
foreach ($result as $row){
    $stmt = $conn->prepare("SELECT name,image,rating,diff FROM recipes WHERE id = ?");
    $stmt->bind_param("i", $row["recipe_id"]);
    $stmt->execute();
    $result2 = $stmt->get_result();
    $recdata = $result2->fetch_assoc();
    $recipe =["name"=>$recdata["name"],"image"=>$recdata["image"],"rating"=>$recdata["rating"],"diff"=>$recdata["diff"],"id"=>$row["recipe_id"]];
    array_push($times[$row["meal"]],$recipe);
}

$times= array_values($times);

if ($times) {
    echo json_encode(["success" => true, "times"=>json_encode($times),"message"=>$year.$month.$day]);
} else {
    echo json_encode(["success" => false, "message" => "No meals found"]);
}

$stmt->close();
$conn->close();

}catch (mysqli_sql_exception $e) {
    // check repeat email
        echo json_encode(["success"=>false,"status" => "error", "message" => "Database error: " . $e->getMessage()]);

}
?>
