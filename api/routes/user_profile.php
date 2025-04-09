<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include controller
include_once '../controllers/UserProfileController.php';

// Initialize controller
$controller = new UserProfileController();

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Get request path
$path = isset($_GET['path']) ? $_GET['path'] : '';
$pathParts = explode('/', $path);

// Process request
if ($method === 'GET' && isset($pathParts[0]) && is_numeric($pathParts[0])) {
    // Get user profile by ID
    $userId = intval($pathParts[0]);
    $result = $controller->getProfile($userId);

    // Set response code
    http_response_code($result['success'] ? 200 : 404);

    // Return response
    echo json_encode($result);
} else if ($method === 'PUT' && isset($pathParts[0]) && is_numeric($pathParts[0])) {
    // Update user profile
    $userId = intval($pathParts[0]);

    // Get request data
    $data = json_decode(file_get_contents("php://input"));

    if (!$data) {
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => "Invalid request data"
        ));
        exit;
    }

    $result = $controller->updateProfile($userId, $data);

    // Set response code
    http_response_code($result['success'] ? 200 : 400);

    // Return response
    echo json_encode($result);
} else if ($method === 'POST' && isset($pathParts[0]) && is_numeric($pathParts[0]) && isset($pathParts[1]) && $pathParts[1] === 'photo') {
    // Upload profile photo
    $userId = intval($pathParts[0]);

    if (!isset($_FILES['photo'])) {
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => "No file uploaded"
        ));
        exit;
    }

    $result = $controller->uploadPhoto($userId, $_FILES['photo']);

    // Set response code
    http_response_code($result['success'] ? 200 : 400);

    // Return response
    echo json_encode($result);
} else if ($method === 'POST' && isset($pathParts[0]) && is_numeric($pathParts[0]) && isset($pathParts[1]) && $pathParts[1] === 'signature') {
    // Upload signature
    $userId = intval($pathParts[0]);

    if (!isset($_FILES['signature'])) {
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => "No signature file uploaded"
        ));
        exit;
    }

    $result = $controller->uploadSignature($userId, $_FILES['signature']);

    // Set response code
    http_response_code($result['success'] ? 200 : 400);

    // Return response
    echo json_encode($result);
} else {
    // Invalid request
    http_response_code(404);
    echo json_encode(array(
        "success" => false,
        "message" => "Invalid request"
    ));
}