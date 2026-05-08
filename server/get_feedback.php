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
if ($data === null || !isset($data['recipe_id'])) {
    echo json_encode(["success" => false, "message" => "Read"]);
    exit();
}

$recipe_id= $data['recipe_id'];
$user_id = $_SESSION['craft_user_id'];

try{
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8");

//Get recipe data
$feedback =[];
$total = 0;
$numRev = 0;

$stmt = $conn->prepare("SELECT rating,feedback,user_id,id FROM reviews WHERE rec_id = ? AND user_id = ?");
$stmt->bind_param("ii", $recipe_id,$user_id);
$stmt->execute();
$result = $stmt->get_result();
$self_data = $result->fetch_assoc();
if(mysqli_num_rows($result) ==1){
    $stmt = $conn->prepare("SELECT username,profile_picture FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result2 = $stmt->get_result();
    $userdata = $result2->fetch_assoc();
    $author =  htmlspecialchars($userdata["username"], ENT_QUOTES);
    $image_url = $userdata["profile_picture"];
    
    array_push($feedback,["rating"=>$self_data["rating"],"feedback"=>$self_data["feedback"],"author"=>$author, "author_id"=>$user_id
, "id"=>$self_data["id"],"profile_picture"=>$image_url,"isUser"=>"User"]);
    $total += $self_data["rating"];
    $numRev++;
}

$stmt = $conn->prepare("SELECT rating,feedback,user_id,id FROM reviews WHERE rec_id = ? AND user_id !=$user_id  ORDER BY id DESC");
$stmt->bind_param("i", $recipe_id);
$stmt->execute();
$result = $stmt->get_result();

foreach ($result as $row){
    $stmt = $conn->prepare("SELECT username,profile_picture FROM users WHERE id = ?");
    $stmt->bind_param("i", $row["user_id"]);
    $stmt->execute();
    $result2 = $stmt->get_result();
    $userdata = $result2->fetch_assoc();
    $author = "Account Deleted";
    if(mysqli_num_rows($result2) ==1){
        $author =  htmlspecialchars($userdata["username"], ENT_QUOTES);
        $image_url = $userdata["profile_picture"];
    }
    
    array_push($feedback,["rating"=>$row["rating"],"feedback"=>$row["feedback"],"author"=>$author
, "author_id"=>$row["user_id"], "id"=>$row["id"],"profile_picture"=>$image_url,"isUser"=>"NOTUser"]);
    $total += $row["rating"];
    $numRev++;
}

$feedback = array_values($feedback);


$total = floatval($total);
$numRev = floatval($numRev);
$average = round(fdiv($total,$numRev),2);
if($numRev==0){
    $average = NULL;
}
$stmt = $conn->prepare("UPDATE recipes SET rating = ? WHERE id = ?");
$stmt->bind_param("di", $average, $recipe_id);
$stmt->execute();

if ($feedback) {
    echo json_encode(["success" => true, "feedback"=>json_encode($feedback),"rating"=>$average,"total"=>$total,"num"=>$numRev]);
} else {
    echo json_encode(["success" => false, "message" => "No feedback found"]);
}

$stmt->close();
$conn->close();

}catch (mysqli_sql_exception $e) {
    // check repeat email
        echo json_encode(["success"=>false,"status" => "error", "message" => "Database error: " . $e->getMessage()]);

}
?>
