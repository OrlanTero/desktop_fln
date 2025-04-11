<?php
// Include database and controllers
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/DocumentController.php';
require_once __DIR__ . '/../controllers/FolderController.php';
require_once __DIR__ . '/../middleware/auth.php';

// Get database connection
$database = new Database();
$db = $database->connect();

// Initialize controllers
$documentController = new DocumentController($db);
$folderController = new FolderController($db);

// Set content type
header('Content-Type: application/json');

// Process requests
$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight OPTIONS request - CORS support
if ($method === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    http_response_code(200);
    exit();
}

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Get request path
$requestPath = isset($_GET['path']) ? $_GET['path'] : '';

// Verify authentication
$auth = new Auth();
$user = $auth->authenticate();

// If authentication fails, return 401 Unauthorized
if (!$user) {
    http_response_code(401);
    echo json_encode(array('status' => 'error', 'message' => 'Unauthorized access'));
    exit();
}

// Get user ID from authentication
$userId = $user['user_id'];

// Routes handler
// GET /folders - Get all folders
// GET /folders/root - Get root folders
// GET /folders/parent/{id} - Get folders by parent ID
// GET /folders/{id} - Get folder by ID
// POST /folders - Create new folder
// PUT /folders/{id} - Update folder
// DELETE /folders/{id} - Delete folder
// GET /documents - Get all documents
// GET /documents/folder/{id} - Get documents by folder ID
// GET /documents/{id} - Get document by ID
// POST /documents/upload - Upload document
// DELETE /documents/{id} - Delete document

// Process request
try {
    // Extract path parameters
    $pathParts = explode('/', trim($requestPath, '/'));
    $resource = $pathParts[0] ?? '';
    $action = $pathParts[1] ?? '';
    $id = $pathParts[2] ?? null;

    // Handle folder routes
    if ($resource === 'folders') {
        switch ($method) {
            case 'GET':
                // GET /folders
                if (empty($action)) {
                    $result = $folderController->getAll();
                }
                // GET /folders/root
                elseif ($action === 'root') {
                    $result = $folderController->getByParent(null);
                }
                // GET /folders/parent/{id}
                elseif ($action === 'parent' && !empty($id)) {
                    $result = $folderController->getByParent($id);
                }
                // GET /folders/{id}
                elseif (is_numeric($action)) {
                    $result = $folderController->getById($action);
                } else {
                    throw new Exception('Invalid folder request');
                }
                break;

            case 'POST':
                // POST /folders
                if (empty($action)) {
                    $requestData = json_decode(file_get_contents('php://input'), true);
                    $result = $folderController->create($requestData, $userId);
                } else {
                    throw new Exception('Invalid folder request');
                }
                break;

            case 'PUT':
                // PUT /folders/{id}
                if (is_numeric($action)) {
                    $requestData = json_decode(file_get_contents('php://input'), true);
                    $result = $folderController->update($action, $requestData, $userId);
                } else {
                    throw new Exception('Invalid folder request');
                }
                break;

            case 'DELETE':
                // DELETE /folders/{id}
                if (is_numeric($action)) {
                    $result = $folderController->delete($action, $userId);
                } else {
                    throw new Exception('Invalid folder request');
                }
                break;

            default:
                throw new Exception('Invalid request method for folders');
        }
    }
    // Handle document routes
    elseif ($resource === 'documents') {
        switch ($method) {
            case 'GET':
                // GET /documents
                if (empty($action)) {
                    $result = $documentController->getAll();
                }
                // GET /documents/folder/{id}
                elseif ($action === 'folder') {
                    $folderId = !empty($id) ? $id : null;
                    $result = $documentController->getByFolder($folderId);
                }
                // GET /documents/{id}
                elseif (is_numeric($action)) {
                    $result = $documentController->getById($action);
                } else {
                    throw new Exception('Invalid document request');
                }
                break;

            case 'POST':
                // POST /documents/upload
                if ($action === 'upload') {
                    $requestData = json_decode(file_get_contents('php://input'), true);
                    $result = $documentController->upload($requestData['file'], $requestData['folder_id'] ?? null, $userId);
                } else {
                    throw new Exception('Invalid document request');
                }
                break;

            case 'DELETE':
                // DELETE /documents/{id}
                if (is_numeric($action)) {
                    $result = $documentController->delete($action);
                } else {
                    throw new Exception('Invalid document request');
                }
                break;

            default:
                throw new Exception('Invalid request method for documents');
        }
    } else {
        throw new Exception('Invalid resource');
    }

    // Output JSON response
    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(array('status' => 'error', 'message' => $e->getMessage()));
}