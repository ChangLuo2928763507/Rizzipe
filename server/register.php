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
    echo json_encode(["status" => "error", "message" => "Bad Token"]);
    exit();
}
try {
    // create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    $conn->set_charset("utf8");

    // get post data
    $username = trim($_POST['username']);
    $email = $_POST['email'];
    $password = $_POST['password'];

    // Username checking
    if (empty($username)) {
        echo json_encode(["status" => "error", "message" => "Username cannot be empty."]);
        exit();
    }

    // Email checking
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Invalid email format."]);
        exit();
    }

    // password checking
    if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/', $password)) {
        echo json_encode(["status" => "error", "message" => "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."]);
        exit();
    }

    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    //If email is already registered, throw error
    if(mysqli_num_rows($result) !=0){
        echo json_encode(["status" => "error", "message" => "Email is already registered"]);
        exit();
    }

    // password hashing
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    
    $stmt = $conn->prepare("INSERT INTO users (email, username, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $email,$username,$hashedPassword);
    $stmt->execute();
    // data insert


    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $userdata = $result->fetch_assoc();

    session_start();
    session_regenerate_id();
    $_SESSION["craft_user_id"] = $userdata["id"];
    $_SESSION["craft_loggedin"] = true;
    $_SESSION["craft_email"] = $userdata["email"];
    $_SESSION["craft_username"] = $userdata["username"];

    echo json_encode(["status" => "success"]);
} catch (mysqli_sql_exception $e) {
    // check repeat email
    if ($e->getCode() == 1062) {
        echo json_encode(["status" => "error", "message" => "This email is already registered."]);
    } else {
        // other error
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
}
?>
