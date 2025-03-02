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
require_once 'controllers/ServiceCategoryController.php';
require_once 'controllers/ServiceController.php';

// Initialize Klein router
$router = new \Klein\Klein();

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize controllers
$userController = new UserController($db);
$clientController = new ClientController($db);
$clientTypeController = new ClientTypeController($db);
$serviceCategoryController = new ServiceCategoryController($db);
$serviceController = new ServiceController($db);

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

// Service Category routes
// Get all service categories
$router->respond('GET', '/service-categories', function() use ($serviceCategoryController) {
    echo json_encode($serviceCategoryController->getAll());
});

// Get service category by ID
$router->respond('GET', '/service-categories/[i:id]', function($request) use ($serviceCategoryController) {
    echo json_encode($serviceCategoryController->getById($request->id));
});

// Create service category
$router->respond('POST', '/service-categories', function($request) use ($serviceCategoryController) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check required fields
    if(!empty($data['service_category_name'])) {
        echo json_encode($serviceCategoryController->create($data));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Service category name is required"
        ]);
    }
});

// Update service category
$router->respond('PUT', '/service-categories/[i:id]', function($request) use ($serviceCategoryController) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check if data is not empty
    if(!empty($data)) {
        echo json_encode($serviceCategoryController->update($request->id, $data));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "No data provided for update"
        ]);
    }
});

// Delete service category
$router->respond('DELETE', '/service-categories/[i:id]', function($request) use ($serviceCategoryController) {
    echo json_encode($serviceCategoryController->delete($request->id));
});

// Service routes
// Get all services
$router->respond('GET', '/services', function() use ($serviceController) {
    echo json_encode($serviceController->getAll());
});

// Get services by category
$router->respond('GET', '/services/category/[i:id]', function($request) use ($serviceController) {
    echo json_encode($serviceController->getByCategory($request->id));
});

// Get service by ID
$router->respond('GET', '/services/[i:id]', function($request) use ($serviceController) {
    echo json_encode($serviceController->getById($request->id));
});

// Create service
$router->respond('POST', '/services', function($request) use ($serviceController) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check required fields
    if(
        !empty($data['service_name']) &&
        !empty($data['service_category_id'])
    ) {
        echo json_encode($serviceController->create($data));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Service name and category ID are required"
        ]);
    }
});

// Update service
$router->respond('PUT', '/services/[i:id]', function($request) use ($serviceController) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check if data is not empty
    if(!empty($data)) {
        echo json_encode($serviceController->update($request->id, $data));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "No data provided for update"
        ]);
    }
});

// Delete service
$router->respond('DELETE', '/services/[i:id]', function($request) use ($serviceController) {
    echo json_encode($serviceController->delete($request->id));
});

// Service Requirements routes
// Get requirements for a service
$router->respond('GET', '/services/[i:id]/requirements', function($request) use ($serviceController) {
    echo json_encode($serviceController->getRequirements($request->id));
});

// Add requirement to a service
$router->respond('POST', '/services/[i:id]/requirements', function($request) use ($serviceController) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check required fields
    if(!empty($data['requirement'])) {
        echo json_encode($serviceController->addRequirement($request->id, $data));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Requirement text is required"
        ]);
    }
});

// Update requirement
$router->respond('PUT', '/requirements/[i:id]', function($request) use ($serviceController) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check if data is not empty
    if(!empty($data) && !empty($data['requirement'])) {
        echo json_encode($serviceController->updateRequirement($request->id, $data));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Requirement text is required"
        ]);
    }
});

// Delete requirement
$router->respond('DELETE', '/requirements/[i:id]', function($request) use ($serviceController) {
    echo json_encode($serviceController->deleteRequirement($request->id));
});

// Dispatch the router
$router->dispatch(); 