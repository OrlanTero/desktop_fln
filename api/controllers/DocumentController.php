<?php
require_once __DIR__ . '/../models/Document.php';

class DocumentController {
    private $document;
    private $uploadDir;

    public function __construct($db) {
        $this->document = new Document($db);
        
        // Set upload directory within the API directory
        $this->uploadDir = __DIR__ . '/../uploads/documents/';
        error_log("DocumentController::__construct - Setting upload directory to: " . $this->uploadDir);
        
        // Create upload directory if it doesn't exist
        if (!file_exists($this->uploadDir)) {
            error_log("DocumentController::__construct - Upload directory doesn't exist, creating it");
            $result = mkdir($this->uploadDir, 0777, true);
            error_log("DocumentController::__construct - Directory creation result: " . ($result ? 'Success' : 'Failed'));
        }
    }

    // Add getter for upload directory
    public function getUploadDir() {
        return $this->uploadDir;
    }

    public function upload($file, $proposalId) {
        try {
            // Debug info
            error_log("DocumentController::upload - Starting upload for proposal ID: $proposalId");
            error_log("DocumentController::upload - Upload directory: " . $this->uploadDir);
            
            // Ensure upload directory exists and is writable
            if (!file_exists($this->uploadDir)) {
                if (!mkdir($this->uploadDir, 0777, true)) {
                    error_log("DocumentController::upload - Failed to create upload directory");
                    return array('success' => false, 'message' => 'Failed to create upload directory');
                }
                chmod($this->uploadDir, 0777);
            }
            
            if (!is_writable($this->uploadDir)) {
                error_log("DocumentController::upload - Upload directory is not writable");
                return array('success' => false, 'message' => 'Upload directory is not writable');
            }

            error_log("DocumentController::upload - Directory exists: " . (file_exists($this->uploadDir) ? 'Yes' : 'No'));
            error_log("DocumentController::upload - Directory is writable: " . (is_writable($this->uploadDir) ? 'Yes' : 'No'));
            
            if (!isset($file['base64']) || !isset($file['name'])) {
                error_log("DocumentController::upload - Invalid file data: missing base64 or name");
                return array('success' => false, 'message' => 'Invalid file data');
            }

            // Debug file data
            error_log("DocumentController::upload - File name: " . $file['name']);
            error_log("DocumentController::upload - Base64 data length: " . strlen($file['base64']));
            error_log("DocumentController::upload - Base64 data starts with: " . substr($file['base64'], 0, 50) . "...");

            // Decode base64 file
            $base64_parts = explode(',', $file['base64']);
            if (count($base64_parts) < 2) {
                error_log("DocumentController::upload - Invalid base64 format, no comma found");
                // Try to use the whole string
                $base64_string = $file['base64'];
            } else {
                $base64_string = $base64_parts[1];
            }
            
            error_log("DocumentController::upload - Extracted base64 string length: " . strlen($base64_string));
            
            $file_data = base64_decode($base64_string);
            if ($file_data === false) {
                error_log("DocumentController::upload - Failed to decode base64 data");
                return array('success' => false, 'message' => 'Failed to decode base64 data');
            }
            
            error_log("DocumentController::upload - Decoded file data length: " . strlen($file_data));

            // Generate unique filename
            $file_name = uniqid() . '_' . $file['name'];
            $full_file_path = $this->uploadDir . $file_name;
            $relative_file_path = 'documents/' . $file_name; // Relative path for database
            
            error_log("DocumentController::upload - Full file path: " . $full_file_path);
            error_log("DocumentController::upload - Relative file path: " . $relative_file_path);
            
            // Save file
            $bytes_written = file_put_contents($full_file_path, $file_data);
            if ($bytes_written !== false) {
                error_log("DocumentController::upload - File saved successfully, bytes written: " . $bytes_written);
                
                // Create document record
                $document_data = (object) array(
                    'proposal_id' => $proposalId,
                    'file_path' => $relative_file_path,
                    'file_name' => $file['name'],
                    'file_type' => pathinfo($file['name'], PATHINFO_EXTENSION)
                );

                $result = $this->document->create($document_data);
                error_log("DocumentController::upload - Document record creation result: " . json_encode($result));
                
                if (!$result['success']) {
                    // If database insert fails, delete the uploaded file
                    unlink($full_file_path);
                    error_log("DocumentController::upload - Deleted file due to database insert failure");
                }
                
                return $result;
            }

            error_log("DocumentController::upload - Failed to save file");
            return array('success' => false, 'message' => 'Failed to save file');
        } catch (Exception $e) {
            error_log("DocumentController::upload - Exception: " . $e->getMessage());
            return array('success' => false, 'message' => $e->getMessage());
        }
    }

    public function getByProposal($proposalId) {
        $doc = $this->document->getByProposal($proposalId);
        error_log("DocumentController::getByProposal - Got document data: " . json_encode($doc));

        if ($doc['success'] && isset($doc['data']['file_path'])) {
            $file_path = __DIR__ . '/../uploads/' . $doc['data']['file_path'];
            $file_name = basename($file_path);
            
            error_log("DocumentController::getByProposal - Attempting to read file: " . $file_path);
            
            if (!file_exists($file_path)) {
                error_log("DocumentController::getByProposal - File not found: " . $file_path);
                return array('success' => false, 'message' => 'Document file not found');
            }
            
            $file_data = file_get_contents($file_path);
            if ($file_data === false) {
                error_log("DocumentController::getByProposal - Failed to read file: " . $file_path);
                return array('success' => false, 'message' => 'Failed to read document file');
            }
            
            $base64_data = base64_encode($file_data);
            error_log("DocumentController::getByProposal - Successfully read file and encoded to base64");
            
            return array('success' => true, 'data' => array(
                'file_name' => $file_name,
                'base64' => $base64_data
            ));
        }
        
        return array('success' => false, 'message' => 'No document found');
    }

    public function delete($documentId) {
        // Get document info first to delete the file
        $doc = $this->document->getByProposal($documentId);
        if ($doc['success'] && isset($doc['data']['file_path'])) {
            // Delete file if it exists
            if (file_exists($doc['data']['file_path'])) {
                unlink($doc['data']['file_path']);
            }
        }
        
        return $this->document->delete($documentId);
    }
} 