<?php
// Enable CORS for both HTTP and HTTPS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");
header("Content-Security-Policy: default-src 'self' data: blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval' blob: data:; worker-src 'self' blob: data:; child-src 'self' blob:; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src 'self' blob:; connect-src 'self' http://localhost:4005 ws: wss: data: blob:; object-src 'none'");

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
require_once 'controllers/ProposalController.php';
require_once 'controllers/ProjectController.php';
require_once 'controllers/ProServiceController.php';
require_once 'controllers/DocumentController.php';
require_once 'controllers/JobOrderController.php';
require_once 'controllers/EmailController.php';

// Add new includes
require_once 'models/CompanyInfo.php';
require_once 'controllers/CompanyInfoController.php';
require_once 'models/Proposal.php';
require_once 'controllers/ProposalController.php';

// Initialize Klein router
$router = new \Klein\Klein();

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize controllers
$userController = new UserController($db);
$clientController = new ClientController($db);
$clientTypeController = new ClientTypeController($db);
$serviceController = new ServiceController($db);
$serviceCategoryController = new ServiceCategoryController($db);
$proposalController = new ProposalController($db);
$projectController = new ProjectController($db);
$proServiceController = new ProServiceController($db);
$documentController = new DocumentController($db);
$jobOrderController = new JobOrderController($db);



// Test route to check if API is working
$router->respond('GET', '/test', function() {
    echo json_encode([
        "status" => "success",
        "message" => dirname(__DIR__)
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

// Pro Service routes
$router->respond('GET', '/pro-services/proposal/[i:id]', function ($request) use ($proServiceController) {
    $proposalId = $request->id;
    $result = $proServiceController->getByProposal($proposalId);
    echo json_encode($result);
});

$router->respond('GET', '/pro-services/project/[i:id]', function ($request) use ($proServiceController) {
    $projectId = $request->id;
    $result = $proServiceController->getByProject($projectId);
    echo json_encode($result);
});

$router->respond('GET', '/pro-services/[i:id]', function ($request) use ($proServiceController) {
    $id = $request->id;
    $result = $proServiceController->getById($id);
    echo json_encode($result);
});

$router->respond('POST', '/pro-services', function ($request) use ($proServiceController) {
    header('Content-Type: application/json');
    try {
        $data = json_decode($request->body(), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON data');
        }
        $result = $proServiceController->create((object)$data);
    echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
});

$router->respond('PUT', '/pro-services/[i:id]', function ($request) use ($proServiceController) {
    $id = $request->id;
    $data = json_decode($request->body());
    $result = $proServiceController->update($id, $data);
    echo json_encode($result);
});

$router->respond('DELETE', '/pro-services/[i:id]', function ($request) use ($proServiceController) {
    $id = $request->id;
    $result = $proServiceController->delete($id);
    echo json_encode($result);
});

$router->respond('DELETE', '/pro-services/proposal/[i:id]', function ($request) use ($proServiceController) {
    $proposalId = $request->id;
    $result = $proServiceController->deleteByProposal($proposalId);
    echo json_encode($result);
});

$router->respond('DELETE', '/pro-services/project/[i:id]', function ($request) use ($proServiceController) {
    $proposalId = $request->id;
    $result = $proServiceController->deleteByProject($proposalId);
    echo json_encode($result);
});

$router->respond('GET', '/pro-services/proposal/[i:id]/total', function ($request) use ($proServiceController) {
    $proposalId = $request->id;
    $result = $proServiceController->calculateProposalTotal($proposalId);
    echo json_encode($result);
});

$router->respond('POST', '/pro-services/proposal/[i:id]/copy-to-project', function ($request) use ($proServiceController) {
    $proposalId = $request->id;
    $result = $proServiceController->copyToProject($proposalId);
    echo json_encode($result);
});

// Company Info endpoints
$router->respond('GET', '/company-info', function() use ($db) {
    $controller = new CompanyInfoController($db);
    echo json_encode($controller->get());
});

$router->respond('PUT', '/company-info', function() use ($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $controller = new CompanyInfoController($db);
    echo json_encode($controller->update($data));
});

// Proposals endpoints
$router->respond('GET', '/proposals', function() use ($db) {
    $controller = new ProposalController($db);
    echo json_encode($controller->getAll());
});

$router->respond('GET', '/proposals/client/[i:id]', function($request) use ($db) {
    $clientId = $request->id;
    $controller = new ProposalController($db);
    echo json_encode($controller->getByClient($clientId));
});

$router->respond('GET', '/proposals/[i:id]', function($request) use ($db) {
    $proposalId = $request->id;
    $controller = new ProposalController($db);
    echo json_encode($controller->getById($proposalId));
});

$router->respond('POST', '/proposals', function() use ($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $controller = new ProposalController($db);
    echo json_encode($controller->create($data));
});

$router->respond('PUT', '/proposals/[i:id]', function($request) use ($db) {
    $proposalId = $request->id;
    $data = json_decode(file_get_contents('php://input'), true);
    $controller = new ProposalController($db);
    echo json_encode($controller->update($proposalId, $data));
});

$router->respond('DELETE', '/proposals/[i:id]', function($request) use ($db) {
    $proposalId = $request->id;
    $controller = new ProposalController($db);
    echo json_encode($controller->delete($proposalId));
});

// Additional proposal endpoints
$router->respond('POST', '/proposals/draft', function() use ($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $data['status'] = 'Draft';
    $controller = new ProposalController($db);
    echo json_encode($controller->create($data));
});

$router->respond('POST', '/proposals/[i:id]/document', function($request) use ($db) {
    $proposalId = $request->id;
    $controller = new ProposalController($db);
    echo json_encode($controller->generateDocument($proposalId));
});

$router->respond('GET', '/proposals/[i:id]/document', function($request) use ($db) {
    $proposalId = $request->id;
    $controller = new ProposalController($db);
    echo json_encode($controller->getDocument($proposalId));
});

$router->respond('PUT', '/proposals/[i:id]/status', function($request) use ($db) {
    $proposalId = $request->id;
    $data = json_decode(file_get_contents('php://input'), true);
    $controller = new ProposalController($db);
    echo json_encode($controller->updateStatus($proposalId, $data['status']));
});

// Get last proposal reference
$router->respond('GET', '/proposals/last-reference', function() use ($proposalController) {
    echo json_encode($proposalController->getLastReference());
});

// Document routes
$router->respond('POST', '/documents/upload/[:proposal_id]', function ($request) use ($documentController) {
    header('Content-Type: application/json');
    $proposalId = $request->proposal_id;
    $fileData = json_decode($request->body(), true);
    return json_encode($documentController->upload($fileData, $proposalId));
});

$router->respond('GET', '/documents/proposal/[:proposal_id]', function ($request) use ($documentController) {
    header('Content-Type: application/json');
    return json_encode($documentController->getByProposal($request->proposal_id));
});

$router->respond('DELETE', '/documents/[:document_id]', function ($request) use ($documentController) {
    header('Content-Type: application/json');
    return json_encode($documentController->delete($request->document_id));
});

// Job Orders Routes
$router->post('/job-orders', function($request) use ($db) {
    $controller = new JobOrderController($db);
    return $controller->create($request);
});

$router->get('/job-orders/service/:serviceId/proposal/:proposalId', function($serviceId, $proposalId) use ($db) {
    $controller = new JobOrderController($db);
    return $controller->getByService($serviceId, $proposalId);
});

$router->put('/job-orders/:id', function($id, $request) use ($db) {
    $controller = new JobOrderController($db);
    return $controller->update($id, $request);
});

$router->delete('/job-orders/:id', function($id) use ($db) {
    $controller = new JobOrderController($db);
    return $controller->delete($id);
});

// Email endpoints
$router->respond('POST', '/email/send', function() use ($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $emailController = new EmailController($db);
    return json_encode($emailController->send($data));
});

// Dispatch the router
$router->dispatch(); 
