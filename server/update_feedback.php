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
    echo json_encode(["status" => "error", "message" => "Bad Token"]);
    exit();
}

if(strlen($_POST['feedback'])>200){
    echo json_encode(["success" => false, "message" => "Review over character limit"]);
    exit();
}

$rec_id= $_POST['rec_id'];
$rating= intval($_POST['rating']);
$feedback= htmlspecialchars($_POST['feedback'], ENT_QUOTES);
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
$stmt->bind_param("i", $rec_id);
$stmt->execute();
$result = $stmt->get_result();
//If no recipe is found, throw error
if(mysqli_num_rows($result) ==0){
    echo json_encode(["success" => false, "message" => "Invalid recipe"]);
    exit();
}

if($rating<1||$rating>5){
    echo json_encode(["success" => false, "message" => "Invalid rating"]);
    exit();
}


$stmt = $conn->prepare("SELECT * FROM recipes WHERE id = ?");
$stmt->bind_param("i",$rec_id);
$stmt->execute();
$result = $stmt->get_result();
//If author is same as reviewer, throw error
foreach ($result as $row){
    if($row['user_id']==$user_id){
        echo json_encode(["success" => false, "message" => "Cannot review your own recipe"]);
        exit();
    }
}

$stmt = $conn->prepare("SELECT * FROM reviews WHERE user_id = ? AND rec_id = ?");
$stmt->bind_param("ii", $user_id,$rec_id);
$stmt->execute();
$result = $stmt->get_result();
//If review found for recipe, update
if(mysqli_num_rows($result) !=0){
    $stmt = $conn->prepare("UPDATE reviews SET rating = ?, feedback = ? WHERE rec_id = ? AND user_id = ?");
    $stmt->bind_param("isii", $rating, $feedback, $rec_id,$user_id);
    $stmt->execute();
} else{
    $stmt = $conn->prepare("INSERT INTO reviews (rating,feedback,user_id,rec_id) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isii", $rating, $feedback, $user_id,$rec_id);
    $stmt->execute();
}

echo json_encode(["success" => true,"message" => "Feedback submitted"]);


$stmt->close();
$conn->close();

}catch (mysqli_sql_exception $e) {
    // check repeat email
        echo json_encode(["success"=>false,"status" => "error", "message" => "Database error: " . $e->getMessage()]);

}
?>
