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
require_once 'controllers/AssignedJobOrderController.php';
require_once 'controllers/JobOrderSubmissionController.php';

// Add new includes
require_once 'models/CompanyInfo.php';
require_once 'controllers/CompanyInfoController.php';
require_once 'models/Proposal.php';
require_once 'controllers/ProposalController.php';
require_once 'models/JobOrderSubmission.php';

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
$emailController = new EmailController($db);
$companyInfoController = new CompanyInfoController($db);
$assignedJobOrderController = new AssignedJobOrderController($db);
$jobOrderSubmissionController = new JobOrderSubmissionController($db);

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

// Project routes
// Get all projects
$router->respond('GET', '/projects', function() use ($projectController) {
    echo json_encode($projectController->getAll());
});

// Get project by ID
$router->respond('GET', '/projects/[i:id]', function($request) use ($projectController) {
    echo json_encode($projectController->getById($request->id));
});

// Create project
$router->respond('POST', '/projects', function($request) use ($projectController) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check required fields
    if(!empty($data['project_name']) && !empty($data['client_id'])) {
        echo json_encode($projectController->create($data));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Project name and client ID are required"
        ]);
    }
});

// Update project
$router->respond('PUT', '/projects/[i:id]', function($request) use ($projectController) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Check if data is not empty
    if(!empty($data)) {
        echo json_encode($projectController->update($request->id, $data));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "No data provided for update"
        ]);
    }
});

// Delete project
$router->respond('DELETE', '/projects/[i:id]', function($request) use ($projectController) {
    echo json_encode($projectController->delete($request->id));
});

// Update project status
$router->respond('PUT', '/projects/[i:id]/status', function($request) use ($projectController) {
    $projectId = $request->id;
    $data = json_decode(file_get_contents('php://input'), true);
    echo json_encode($projectController->updateStatus($projectId, $data));
});

// Update project payment
$router->respond('PUT', '/projects/[i:id]/payment', function($request) use ($projectController) {
    $projectId = $request->id;
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['amount'])) {
        echo json_encode($projectController->recordPayment($projectId, $data['amount']));
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Payment amount is required"
        ]);
    }
});

// Get project status history
$router->respond('GET', '/projects/[i:id]/status-history', function($request) use ($projectController) {
    $projectId = $request->id;
    echo json_encode($projectController->getStatusHistory($projectId));
});

// Get project timeline
$router->respond('GET', '/projects/[i:id]/timeline', function($request) use ($projectController) {
    $projectId = $request->id;
    echo json_encode($projectController->getTimeline($projectId));
});

// Update project timeline
$router->respond('PUT', '/projects/[i:id]/timeline', function($request) use ($projectController) {
    $projectId = $request->id;
    $data = json_decode(file_get_contents('php://input'), true);
    echo json_encode($projectController->updateTimeline($projectId, $data));
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

$router->respond('PUT', '/proposals/[:id]/[:status]', function($request) use ($db) {
    $proposalId = $request->id;
    $status = $request->status;
    $controller = new ProposalController($db);
    echo json_encode($controller->updateOnlyStatus($proposalId, $status));
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
    echo json_encode($controller->updateStatus($proposalId, $data));
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
$router->respond('POST', '/job-orders', function($request) use ($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $controller = new JobOrderController($db);
    echo json_encode($controller->create($data));
});

$router->respond('GET', '/job-orders', function() use ($db) {
    $controller = new JobOrderController($db);
    echo json_encode($controller->getAll());
});

$router->respond('GET', '/job-orders/project/[i:projectId]', function($request) use ($db) {
    $projectId = $request->projectId;
    $controller = new JobOrderController($db);
    echo json_encode($controller->getByProject($projectId));
});

$router->respond('GET', '/job-orders/service/[:serviceId]/proposal/[:proposalId]', function($request) use ($db) {
    $controller = new JobOrderController($db);
    return json_encode($controller->getByService($request->serviceId, $request->proposalId));
});

$router->put('/job-orders/:id', function($id, $request) use ($db) {
    $controller = new JobOrderController($db);
    return $controller->update($id, $request);
});

$router->delete('/job-orders/:id', function($id) use ($db) {
    $controller = new JobOrderController($db);
    return $controller->delete($id);
});

// Assigned Job Orders Routes
$router->respond('POST', '/job-orders/assign', function() use ($assignedJobOrderController) {
    $data = json_decode(file_get_contents('php://input'), true);
    echo json_encode($assignedJobOrderController->create($data));
});

$router->respond('GET', '/job-orders/assigned/project/[i:projectId]', function($request) use ($assignedJobOrderController) {
    try {
        $result = $assignedJobOrderController->getAssignedByProject($request->projectId);
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error in assigned job orders endpoint: ' . $e->getMessage()
        ]);
    }
});

$router->respond('GET', '/job-orders/unassigned/project/[i:projectId]', function($request) use ($assignedJobOrderController) {
    try {
        $result = $assignedJobOrderController->getUnassignedByProject($request->projectId);
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error in unassigned job orders endpoint: ' . $e->getMessage()
        ]);
    }
});

$router->respond('PUT', '/job-orders/assigned/[i:id]/status', function($request) use ($assignedJobOrderController) {
    $data = json_decode(file_get_contents('php://input'), true);
    echo json_encode($assignedJobOrderController->updateStatus($request->id, $data));
});

$router->respond('DELETE', '/job-orders/assigned/[i:id]', function($request) use ($assignedJobOrderController) {
    echo json_encode($assignedJobOrderController->delete($request->id));
});

// Email endpoints
$router->respond('POST', '/email/send', function() use ($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $emailController = new EmailController($db);
    return json_encode($emailController->send($data));
});

// Job Order Submission endpoints
$router->respond('POST', '/job-orders/submit-completion', function() use ($jobOrderSubmissionController) {
    // For multipart/form-data with file uploads, we need to handle the data differently
    $data = new stdClass();
    $data->job_order_id = $_POST['job_order_id'] ?? null;
    $data->liaison_id = $_POST['liaison_id'] ?? null;
    $data->notes = $_POST['notes'] ?? '';
    
    // Parse expenses JSON if provided
    if (isset($_POST['expenses'])) {
        $data->expenses = json_decode($_POST['expenses']);
    } else {
        $data->expenses = [];
    }
    
    echo json_encode($jobOrderSubmissionController->create($data));
});

$router->respond('GET', '/job-orders/submissions/[i:id]', function($request) use ($jobOrderSubmissionController) {
    echo json_encode($jobOrderSubmissionController->getById($request->id));
});

$router->respond('GET', '/job-orders/[i:jobOrderId]/submissions', function($request) use ($jobOrderSubmissionController) {
    echo json_encode($jobOrderSubmissionController->getByJobOrderId($request->jobOrderId));
});

$router->respond('GET', '/liaisons/[i:liaisonId]/submissions', function($request) use ($jobOrderSubmissionController) {
    echo json_encode($jobOrderSubmissionController->getByLiaisonId($request->liaisonId));
});

$router->respond('PUT', '/job-orders/submissions/[i:id]/status', function($request) use ($jobOrderSubmissionController) {
    $data = json_decode(file_get_contents('php://input'), true);
    echo json_encode($jobOrderSubmissionController->updateStatus($request->id, $data['status']));
});

$router->respond('DELETE', '/job-orders/submissions/[i:id]', function($request) use ($jobOrderSubmissionController) {
    echo json_encode($jobOrderSubmissionController->delete($request->id));
});

// Dispatch the router
$router->dispatch(); 
