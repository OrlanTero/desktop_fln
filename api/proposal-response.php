<?php
require_once 'config/Database.php';
require_once 'controllers/ProposalController.php';

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get parameters
$action = isset($_GET['action']) ? strtolower($_GET['action']) : '';
$proposalId = isset($_GET['proposal_id']) && !empty($_GET['proposal_id']) ? (int)$_GET['proposal_id'] : 0;

// Validate action
if (!in_array($action, ['accept', 'decline'])) {
    $error = 'Invalid action specified. Please use the link provided in the email.';
}

// Validate proposal ID
if ($proposalId <= 0) {
    $error = 'Invalid proposal ID. Please use the link provided in the email.';
}

// Initialize response
$response = [
    'success' => false,
    'message' => '',
    'proposal' => null,
    'error' => isset($error) ? $error : ''
];

if (!isset($error)) {
    try {
        // Create database connection
        $database = new Database();
        $db = $database->getConnection();
        
        // Create proposal controller
        $proposalController = new ProposalController($db);
        
        // Get proposal data
        $proposal = $proposalController->getById($proposalId);
        
        if (!$proposal) {
            throw new Exception('Proposal not found. Please check the link and try again.');
        }

        if ($proposal['data']['status'] === 'ACCEPTED' || $proposal['data']['status'] === 'DECLINED') {
            throw new Exception('Proposal already accepted or declined. Please check the link and try again.');
        }

        $response['proposal'] = $proposal['data'];
        
        // Handle form submission
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $notes = isset($_POST['notes']) ? trim($_POST['notes']) : '';
            
            if (empty($notes)) {
                throw new Exception('Please provide your comments or notes.');
            }
            
            $status = ($action === 'accept') ? 'Accepted' : 'Declined';
            
            // Update proposal status
            $result = $proposalController->updateStatus($proposalId, [
                'status' => $status,
                'notes' => $notes,
                'response_date' => date('Y-m-d H:i:s')
            ]);
            
            if (!$result || !isset($result['success']) || !$result['success']) {
                throw new Exception('Failed to update proposal status. Please try again.');
            }
            
            // If accepted, also update the notes and response date
            if ($status === 'Accepted') {
                $query = "UPDATE proposals 
                          SET notes = :notes,
                              response_date = :response_date
                          WHERE proposal_id = :id";
                
                $stmt = $db->prepare($query);
                $stmt->bindParam(':notes', $notes);
                $stmt->bindParam(':response_date', date('Y-m-d H:i:s'));
                $stmt->bindParam(':id', $proposalId);
                
                if (!$stmt->execute()) {
                    throw new Exception('Failed to update proposal notes. Please try again.');
                }
            }
            
            $response['success'] = true;
            $response['message'] = 'Thank you for your response. The proposal has been ' . strtolower($status) . '.';
        }
    } catch (Exception $e) {
        $response['error'] = $e->getMessage();
    }
}

// HTML response page
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proposal Response</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #dee2e6;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            min-height: 100px;
            box-sizing: border-box;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            background-color: #007bff;
            color: white;
            cursor: pointer;
            font-size: 16px;
        }
        .button.accept {
            background-color: #28a745;
        }
        .button.decline {
            background-color: #dc3545;
        }
        .button:hover {
            opacity: 0.9;
        }
        .message {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .proposal-details {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Proposal Response</h1>
        </div>
        
        <?php if ($response['success']): ?>
            <div class="message success">
                <?php echo htmlspecialchars($response['message']); ?>
            </div>
        <?php elseif ($response['error']): ?>
            <div class="message error">
                <?php echo htmlspecialchars($response['error']); ?>
            </div>
        <?php elseif ($response['proposal']): ?>
            <div class="proposal-details">
                <p><strong>Reference:</strong> <?php echo htmlspecialchars($response['proposal']['proposal_reference']); ?></p>
                <p><strong>Action:</strong> <?php echo ucfirst($action); ?> Proposal</p>
            </div>
            
            <form method="POST" action="">
                <div class="form-group">
                    <label for="notes">Please provide any comments or notes:</label>
                    <textarea id="notes" name="notes" required placeholder="Enter your comments here..."></textarea>
                </div>
                
                <div style="text-align: center;">
                    <button type="submit" class="button <?php echo $action; ?>">
                        Confirm <?php echo ucfirst($action); ?>
                    </button>
                </div>
            </form>
        <?php endif; ?>
    </div>
</body>
</html> 