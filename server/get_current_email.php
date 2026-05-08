<?php
// Allow CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Include the env.php file to get database credentials
require_once 'env.php';

// Start the session
session_start();

// Check if the request method is GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Check if the user is logged in
    if (isset($_SESSION['craft_loggedin']) && $_SESSION['craft_loggedin'] == true) {
        // User is logged in, get the user ID from the session
        $userId = $_SESSION['craft_user_id'];

        try {
            // Database connection using credentials from env.php
            $pdo = new PDO("mysql:host=" . servername . ";dbname=" . dbname, username, password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Fetch the email of the logged-in user
            $stmt = $pdo->prepare("SELECT email FROM users WHERE id = :user_id");
            $stmt->execute(['user_id' => $userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && !empty($user['email'])) {
                // Email found, return it
               
                echo json_encode(['status' => 'success', 'email' =>  htmlspecialchars($user['email'], ENT_QUOTES)]);
            } else {
                // No email found for the user
                echo json_encode(['status' => 'error', 'message' => 'No email found for this user']);
            }
        } catch (PDOException $e) {
            // Database error
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        // User is not logged in
        echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    }
} else {
    // Invalid request method
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>