<?php
// allows CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require("./env.php");
$servername = constant("servername");
$username = constant("username");
$password = constant("password");
$dbname = constant("dbname");

// exception
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
session_start();
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
echo json_encode(["status" => "error", "message" => "Bad Token. Refresh the page and try again."]);
exit();
}

try {
    // create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    $conn->set_charset("utf8");

    // get post data
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    // Email checking
    if ($email == "") {
        echo json_encode(["status" => "Error", "message" => "Please enter an email"]);
        exit();
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "Error", "message" => "Invalid email format."]);
        exit();
    }

    //password check
    if ($password == "") {
        echo json_encode(["status" => "Error", "message" => "Please enter a password"]);
        exit();
    }

    //account lookup
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $userdata = $result->fetch_assoc();

    //If no email is found, throw error
    if(mysqli_num_rows($result) ==0){
    echo json_encode(["status" => "Error", "message" => "No account associated with this email"]);
    } elseif(mysqli_num_rows($result)==1){
        //password verification, set session variables to log in
        if(password_verify($password, $userdata["password"])){
            session_start();
            session_regenerate_id();
            $_SESSION["craft_user_id"] = $userdata["id"];
            $_SESSION["craft_loggedin"] = true;
            $_SESSION["craft_email"] = $userdata["email"];
            echo json_encode(["status" => "Success!","message" => "You have been successfully logged in!"]);
        } else{
            //incorrect password
            echo json_encode(["status" => "Error", "message" => "The password you have entered is incorrect"]);
        }
        
    } else{
        //database query fails
        echo json_encode(["status" => "Error", "message" => "Database error: "]);
    }
    
} catch (mysqli_sql_exception $e) {

}
?>