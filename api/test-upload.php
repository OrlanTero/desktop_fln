<?php
// Test script to directly test the document upload API endpoint

// Include necessary files
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/controllers/DocumentController.php';

// Set error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Test upload script started\n";

// Create database connection
$database = new Database();
$db = $database->getConnection();

// Create document controller
$documentController = new DocumentController($db);

// Get upload directory
$uploadDir = $documentController->getUploadDir();
echo "Upload directory: $uploadDir\n";
echo "Directory exists: " . (file_exists($uploadDir) ? 'Yes' : 'No') . "\n";
echo "Directory is writable: " . (is_writable($uploadDir) ? 'Yes' : 'No') . "\n";

// Create directory if it doesn't exist
if (!file_exists($uploadDir)) {
    echo "Creating directory...\n";
    $result = mkdir($uploadDir, 0777, true);
    echo "Directory creation result: " . ($result ? 'Success' : 'Failed') . "\n";
    
    // Check again after creation
    echo "Directory exists after creation: " . (file_exists($uploadDir) ? 'Yes' : 'No') . "\n";
    echo "Directory is writable after creation: " . (is_writable($uploadDir) ? 'Yes' : 'No') . "\n";
}

// Get a valid proposal ID from the database
try {
    // First try with 'id' column
    $stmt = $db->prepare("SELECT id FROM proposals ORDER BY id DESC LIMIT 1");
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($row) {
        $proposalId = $row['id'];
    } else {
        // Try with 'proposal_id' column if 'id' doesn't work
        $stmt = $db->prepare("SELECT proposal_id FROM proposals ORDER BY proposal_id DESC LIMIT 1");
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $proposalId = $row ? $row['proposal_id'] : 1;
    }
} catch (Exception $e) {
    echo "Error querying database: " . $e->getMessage() . "\n";
    $proposalId = 1;
}

echo "Using proposal ID: $proposalId\n";

// Create a simple PDF for testing
$testPdf = '%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj
xref
0 4
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000102 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
178
%%EOF';

// Base64 encode the PDF
$base64Data = 'data:application/pdf;base64,' . base64_encode($testPdf);

// Create test file data
$file = [
    'name' => 'test-document-' . time() . '.pdf',
    'base64' => $base64Data
];

echo "Test file name: " . $file['name'] . "\n";
echo "Base64 data length: " . strlen($file['base64']) . "\n";

// Try direct file write first to test permissions
$directTestFile = $uploadDir . 'direct-test-' . time() . '.txt';
echo "Testing direct file write to: $directTestFile\n";
$directWriteResult = file_put_contents($directTestFile, "This is a test file to verify write permissions.");
echo "Direct write result: " . ($directWriteResult !== false ? "$directWriteResult bytes written" : "Failed") . "\n";
echo "Direct test file exists: " . (file_exists($directTestFile) ? 'Yes' : 'No') . "\n";

// Try to upload the document
echo "Attempting document upload...\n";
$result = $documentController->upload($file, $proposalId);
echo "Upload result: " . json_encode($result) . "\n";

// Check if the file was created
if (isset($result['data']['file_path'])) {
    $filePath = $result['data']['file_path'];
    echo "Checking if file exists at: $filePath\n";
    echo "File exists: " . (file_exists($filePath) ? 'Yes' : 'No') . "\n";
    
    // List files in the directory
    echo "Files in upload directory:\n";
    $files = scandir($uploadDir);
    foreach ($files as $file) {
        if ($file != '.' && $file != '..') {
            echo "- $file\n";
        }
    }
}

echo "Test completed\n"; 