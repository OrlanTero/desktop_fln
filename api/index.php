<?php
// Enable CORS for both HTTP and HTTPS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include Composer autoloader
require 'vendor/autoload.php';

// Include database configuration
require_once 'config/database.php';

// Include controllers
require_once 'controllers/UserController.php';
require_once 'controllers/ClientController.php';
require_once 'controllers/ClientTypeController.php';

// Initialize Klein router
$router = new \Klein\Klein();

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize controllers
$userController = new UserController($db);
$clientController = new ClientController($db);
$clientTypeController = new ClientTypeController($db);

// Test route to check if API is working
$router->respond('GET', '/test', function() {
    echo json_encode([
        "status" => "success",
        "message" => "API is working!"
    ]);
});

// Get database connection
$router->respond('GET', '/db-test', function() use ($db) {
    if($db) {
        echo json_encode([
            "status" => "success",
            "message" => "Database connection successful!"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Database connection failed!"
        ]);
    }
});

// User routes
// Get all users
$router->respond('GET', '/users', function() use ($userController) {
    echo json_encode($userController->getAll());
});

// Get user by ID
$router->respond('GET', '/users/[i:id]', function($request) use ($userController) {
    echo json_encode($userController->getById($request->id));
});

// Create user
$router->respond('POST', '/users', function($request) use ($userController) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check required fields
    if(
        !empty($data['name']) &&
        !empty($data['email']) &&
        !empty($data['password'])
    ) {
        echo json_encode($userController->create($data));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Missing required fields"
        ]);
    }
});

// Update user
$router->respond('PUT', '/users/[i:id]', function($request) use ($userController) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check if data is not empty
    if(!empty($data)) {
        echo json_encode($userController->update($request->id, $data));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "No data provided for update"
        ]);
    }
});

// Update password
$router->respond('PUT', '/users/[i:id]/password', function($request) use ($userController) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check if password is provided
    if(!empty($data['password'])) {
        echo json_encode($userController->updatePassword($request->id, $data));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Password is required"
        ]);
    }
});

// Delete user
$router->respond('DELETE', '/users/[i:id]', function($request) use ($userController) {
    echo json_encode($userController->delete($request->id));
});

// Login user
$router->respond('POST', '/login', function() use ($userController) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check required fields
    if(
        !empty($data['email']) &&
        !empty($data['password'])
    ) {
        echo json_encode($userController->login($data));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Email and password are required"
        ]);
    }
});

// Client Type routes
// Get all client types
$router->respond('GET', '/client-types', function() use ($clientTypeController) {
    echo json_encode($clientTypeController->getAll());
});

// Get client type by ID
$router->respond('GET', '/client-types/[i:id]', function($request) use ($clientTypeController) {
    echo json_encode($clientTypeController->getById($request->id));
});

// Create client type
$router->respond('POST', '/client-types', function($request) use ($clientTypeController) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check required fields
    if(!empty($data['name'])) {
        echo json_encode($clientTypeController->create($data));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Name is required"
        ]);
    }
});

// Update client type
$router->respond('PUT', '/client-types/[i:id]', function($request) use ($clientTypeController) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check if data is not empty
    if(!empty($data)) {
        echo json_encode($clientTypeController->update($request->id, $data));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "No data provided for update"
        ]);
    }
});

// Delete client type
$router->respond('DELETE', '/client-types/[i:id]', function($request) use ($clientTypeController) {
    echo json_encode($clientTypeController->delete($request->id));
});

// Client routes
// Get all clients
$router->respond('GET', '/clients', function() use ($clientController) {
    echo json_encode($clientController->getAll());
});

// Get client by ID
$router->respond('GET', '/clients/[i:id]', function($request) use ($clientController) {
    echo json_encode($clientController->getById($request->id));
});

// Create client
$router->respond('POST', '/clients', function($request) use ($clientController) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check required fields
    if(!empty($data['client_name'])) {
        echo json_encode($clientController->create($data));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Client name is required"
        ]);
    }
});

// Update client
$router->respond('PUT', '/clients/[i:id]', function($request) use ($clientController) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check if data is not empty
    if(!empty($data)) {
        echo json_encode($clientController->update($request->id, $data));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "No data provided for update"
        ]);
    }
});

// Delete client
$router->respond('DELETE', '/clients/[i:id]', function($request) use ($clientController) {
    echo json_encode($clientController->delete($request->id));
});

// Dispatch the router
$router->dispatch(); 