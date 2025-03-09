<?php
class TaskController {
    private $db;
    private $task;
    
    public function __construct($db) {
        $this->db = $db;
        $this->task = new Task($db);
    }
    
    // Get all tasks
    public function getAllTasks() {
        $stmt = $this->task->getAll();
        $num = $stmt->rowCount();
        
        if($num > 0) {
            $tasks_arr = array();
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $task_item = array(
                    "id" => $row['id'],
                    "liaison_id" => $row['liaison_id'],
                    "liaison_name" => $row['liaison_name'],
                    "service_id" => $row['service_id'],
                    "service_name" => $row['service_name'],
                    "service_category_name" => $row['service_category_name'],
                    "description" => $row['description'],
                    "status" => $row['status'],
                    "due_date" => $row['due_date'],
                    "created_at" => $row['created_at'],
                    "updated_at" => $row['updated_at']
                );
                
                array_push($tasks_arr, $task_item);
            }
            
            return [
                "status" => "success",
                "data" => $tasks_arr
            ];
        } else {
            return [
                "status" => "error",
                "message" => "No tasks found"
            ];
        }
    }
    
    // Get tasks by liaison
    public function getTasksByLiaison($liaison_id) {
        $stmt = $this->task->getByLiaison($liaison_id);
        $num = $stmt->rowCount();
        
        if($num > 0) {
            $tasks_arr = array();
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $task_item = array(
                    "id" => $row['id'],
                    "liaison_id" => $row['liaison_id'],
                    "liaison_name" => $row['liaison_name'],
                    "service_id" => $row['service_id'],
                    "service_name" => $row['service_name'],
                    "service_category_name" => $row['service_category_name'],
                    "description" => $row['description'],
                    "status" => $row['status'],
                    "due_date" => $row['due_date'],
                    "created_at" => $row['created_at'],
                    "updated_at" => $row['updated_at']
                );
                
                array_push($tasks_arr, $task_item);
            }
            
            return [
                "status" => "success",
                "data" => $tasks_arr
            ];
        } else {
            return [
                "status" => "success",
                "data" => []
            ];
        }
    }
    
    // Create task
    public function createTask($data) {
        // Set task properties
        $this->task->liaison_id = $data->liaison_id;
        $this->task->service_id = isset($data->service_id) ? $data->service_id : null;
        $this->task->description = $data->description;
        $this->task->status = isset($data->status) ? $data->status : 'PENDING';
        $this->task->due_date = isset($data->due_date) ? $data->due_date : null;
        
        // Create task
        if($this->task->create()) {
            http_response_code(201);
            return array(
                "status" => "success",
                "message" => "Task was created successfully.",
                "id" => $this->task->id
            );
        } else {
            http_response_code(503);
            return array(
                "status" => "error",
                "message" => "Unable to create task."
            );
        }
    }
    
    // Update task
    public function updateTask($id, $data) {
        // Set task properties
        $this->task->id = $id;
        
        // Check if task exists
        if(!$this->task->getById()) {
            http_response_code(404);
            return json_encode(array("message" => "Task not found."));
        }
        
        $this->task->liaison_id = $data->liaison_id;
        $this->task->service_id = isset($data->service_id) ? $data->service_id : null;
        $this->task->description = $data->description;
        $this->task->status = $data->status;
        $this->task->due_date = isset($data->due_date) ? $data->due_date : null;
        
        // Update task
        if($this->task->update()) {
            http_response_code(200);
            return json_encode(array("message" => "Task was updated successfully."));
        } else {
            http_response_code(503);
            return json_encode(array("message" => "Unable to update task."));
        }
    }
    
    // Update task status
    public function updateTaskStatus($id, $data) {
        // Set task properties
        $this->task->id = $id;
        
        // Check if task exists
        if(!$this->task->getById()) {
            http_response_code(404);
            return array(
                "status" => "error",
                "message" => "Task not found."
            );
        }
        
        $this->task->status = $data->status;
        
        // Update task status
        if($this->task->updateStatus()) {
            http_response_code(200);
            return array(
                "status" => "success",
                "message" => "Task status was updated successfully."
            );
        } else {
            http_response_code(503);
            return array(
                "status" => "error",
                "message" => "Unable to update task status."
            );
        }
    }
    
    // Delete task
    public function deleteTask($id) {
        // Set task ID
        $this->task->id = $id;
        
        // Check if task exists
        if(!$this->task->getById()) {
            http_response_code(404);
            return json_encode(array("message" => "Task not found."));
        }
        
        // Delete task
        if($this->task->delete()) {
            http_response_code(200);
            return json_encode(array("message" => "Task was deleted successfully."));
        } else {
            http_response_code(503);
            return json_encode(array("message" => "Unable to delete task."));
        }
    }
    
    // Get task by ID
    public function getTaskById($id) {
        $this->task->id = $id;
        
        if($this->task->getById()) {
            $task_item = array(
                "id" => $this->task->id,
                "liaison_id" => $this->task->liaison_id,
                "liaison_name" => $this->task->liaison_name,
                "service_id" => $this->task->service_id,
                "service_name" => $this->task->service_name,
                "service_category_name" => $this->task->service_category_name,
                "description" => $this->task->description,
                "status" => $this->task->status,
                "due_date" => $this->task->due_date,
                "created_at" => $this->task->created_at,
                "updated_at" => $this->task->updated_at
            );
            
            return [
                "status" => "success",
                "data" => $task_item
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Task not found"
            ];
        }
    }
    
    // Submit task completion
    public function submitCompletion($postData, $files) {
        try {
            // Validate required fields
            if (!isset($postData['task_id'])) {
                return [
                    "status" => "error",
                    "message" => "Task ID is required"
                ];
            }
            
            if (!isset($postData['liaison_id'])) {
                return [
                    "status" => "error",
                    "message" => "Liaison ID is required"
                ];
            }
            
            // Create submission record
            $db = $this->db;
            
            // Start transaction
            $db->beginTransaction();
            
            try {
                // Insert submission record
                $query = "INSERT INTO task_submissions 
                          (task_id, liaison_id, notes, created_at) 
                          VALUES 
                          (:task_id, :liaison_id, :notes, NOW())";
                
                $stmt = $db->prepare($query);
                
                // Prepare data
                $taskId = htmlspecialchars(strip_tags($postData['task_id']));
                $liaisonId = htmlspecialchars(strip_tags($postData['liaison_id']));
                $notes = isset($postData['notes']) ? htmlspecialchars(strip_tags($postData['notes'])) : '';
                
                // Bind parameters
                $stmt->bindParam(':task_id', $taskId);
                $stmt->bindParam(':liaison_id', $liaisonId);
                $stmt->bindParam(':notes', $notes);
                
                // Execute query
                $stmt->execute();
                
                // Get submission ID
                $submissionId = $db->lastInsertId();
                
                // Process expenses if any
                if (isset($postData['expenses']) && !empty($postData['expenses'])) {
                    $this->processExpenses($submissionId, $postData['expenses']);
                }
                
                // Process file attachments if any
                if (isset($files['attachments']) && !empty($files['attachments'])) {
                    // Check if it's a single file or multiple files
                    if (isset($files['attachments']['name']) && !is_array($files['attachments']['name'])) {
                        // Single file
                        $this->processAttachments($submissionId, [$files['attachments']]);
                    } else {
                        // Multiple files
                        $attachments = [];
                        $fileCount = count($files['attachments']['name']);
                        
                        for ($i = 0; $i < $fileCount; $i++) {
                            $attachments[] = [
                                'name' => $files['attachments']['name'][$i],
                                'type' => $files['attachments']['type'][$i],
                                'tmp_name' => $files['attachments']['tmp_name'][$i],
                                'error' => $files['attachments']['error'][$i],
                                'size' => $files['attachments']['size'][$i]
                            ];
                        }
                        
                        $this->processAttachments($submissionId, $attachments);
                    }
                }
                
                // Update task status to SUBMITTED
                $this->task->id = $taskId;
                $this->task->status = 'SUBMITTED';
                $this->task->updateStatus();
                
                // Commit transaction
                $db->commit();
                
                return [
                    "status" => "success",
                    "message" => "Task submission created successfully",
                    "data" => [
                        "submission_id" => $submissionId
                    ]
                ];
            } catch (Exception $e) {
                // Rollback transaction on error
                $db->rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            return [
                "status" => "error",
                "message" => "Failed to submit task completion: " . $e->getMessage()
            ];
        }
    }
    
    // Process expenses
    private function processExpenses($submissionId, $expensesJson) {
        try {
            // Parse expenses JSON if it's a string
            $expenses = is_string($expensesJson) ? json_decode($expensesJson, true) : $expensesJson;
            
            if (!is_array($expenses)) {
                error_log("Invalid expenses data: " . print_r($expensesJson, true));
                return;
            }
            
            // Process each expense
            foreach ($expenses as $expense) {
                // Skip if required fields are missing
                if (!isset($expense['description']) || !isset($expense['amount'])) {
                    continue;
                }
                
                // Insert expense record
                $query = "INSERT INTO task_submission_expenses 
                          (submission_id, description, amount, created_at) 
                          VALUES 
                          (:submission_id, :description, :amount, NOW())";
                
                $stmt = $this->db->prepare($query);
                
                // Prepare data
                $description = htmlspecialchars(strip_tags($expense['description']));
                $amount = floatval($expense['amount']);
                
                // Bind parameters
                $stmt->bindParam(':submission_id', $submissionId);
                $stmt->bindParam(':description', $description);
                $stmt->bindParam(':amount', $amount);
                
                // Execute query
                $stmt->execute();
            }
        } catch (Exception $e) {
            error_log("Error processing expenses: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Process attachments
    private function processAttachments($submissionId, $attachments) {
        try {
            // Create uploads directory if it doesn't exist
            $uploadsDir = dirname(__FILE__) . '/../../uploads/task_attachments/';
            if (!file_exists($uploadsDir)) {
                mkdir($uploadsDir, 0777, true);
            }
            
            // Process each attachment
            foreach ($attachments as $attachment) {
                // Skip if not a valid file
                if (!isset($attachment['name']) || empty($attachment['name'])) {
                    continue;
                }
                
                // Generate unique filename
                $filename = uniqid() . '_' . basename($attachment['name']);
                $targetPath = $uploadsDir . $filename;
                $relativePath = 'uploads/task_attachments/' . $filename;
                
                // Move uploaded file
                if (move_uploaded_file($attachment['tmp_name'], $targetPath)) {
                    // Determine file type and size
                    $fileType = $attachment['type'] ?? mime_content_type($targetPath);
                    $fileSize = $attachment['size'] ?? filesize($targetPath);
                    
                    // Insert attachment record
                    $query = "INSERT INTO task_submission_attachments 
                              (submission_id, filename, file_path, file_type, file_size, created_at) 
                              VALUES 
                              (:submission_id, :filename, :file_path, :file_type, :file_size, NOW())";
                    
                    $stmt = $this->db->prepare($query);
                    
                    // Bind parameters
                    $stmt->bindParam(':submission_id', $submissionId);
                    $stmt->bindParam(':filename', $filename);
                    $stmt->bindParam(':file_path', $relativePath);
                    $stmt->bindParam(':file_type', $fileType);
                    $stmt->bindParam(':file_size', $fileSize);
                    
                    // Execute query
                    $stmt->execute();
                } else {
                    error_log("Failed to move uploaded file: " . $attachment['name']);
                }
            }
            
            // Process manual attachments if any
            if (isset($_POST['manual_attachments'])) {
                $manualAttachments = json_decode($_POST['manual_attachments'], true);
                
                if (is_array($manualAttachments) && !empty($manualAttachments)) {
                    foreach ($manualAttachments as $attachmentName) {
                        // Insert manual attachment record
                        $query = "INSERT INTO task_submission_attachments 
                                  (submission_id, filename, file_path, file_type, file_size, created_at) 
                                  VALUES 
                                  (:submission_id, :filename, :file_path, :file_type, :file_size, NOW())";
                        
                        $stmt = $this->db->prepare($query);
                        
                        // Prepare data
                        $filename = htmlspecialchars(strip_tags($attachmentName));
                        $filePath = 'manual_attachment';
                        $fileType = 'text/plain';
                        $fileSize = 0;
                        
                        // Bind parameters
                        $stmt->bindParam(':submission_id', $submissionId);
                        $stmt->bindParam(':filename', $filename);
                        $stmt->bindParam(':file_path', $filePath);
                        $stmt->bindParam(':file_type', $fileType);
                        $stmt->bindParam(':file_size', $fileSize);
                        
                        // Execute query
                        $stmt->execute();
                    }
                }
            }
        } catch (Exception $e) {
            error_log("Error processing attachments: " . $e->getMessage());
            throw $e;
        }
    }
    
    // Update task submission
    public function updateSubmission($postData, $files) {
        try {
            // Validate required fields
            if (!isset($postData['submission_id'])) {
                return [
                    "status" => "error",
                    "message" => "Submission ID is required"
                ];
            }
            
            // Create submission record
            $db = $this->db;
            
            // Start transaction
            $db->beginTransaction();
            
            try {
                // Update submission record
                $query = "UPDATE task_submissions 
                          SET notes = :notes, 
                              updated_at = NOW() 
                          WHERE id = :submission_id";
                
                $stmt = $db->prepare($query);
                
                // Prepare data
                $submissionId = htmlspecialchars(strip_tags($postData['submission_id']));
                $notes = isset($postData['notes']) ? htmlspecialchars(strip_tags($postData['notes'])) : '';
                
                // Bind parameters
                $stmt->bindParam(':notes', $notes);
                $stmt->bindParam(':submission_id', $submissionId);
                
                // Execute query
                $stmt->execute();
                
                // Delete existing expenses
                $query = "DELETE FROM task_submission_expenses WHERE submission_id = :submission_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':submission_id', $submissionId);
                $stmt->execute();
                
                // Process expenses if any
                if (isset($postData['expenses']) && !empty($postData['expenses'])) {
                    $this->processExpenses($submissionId, $postData['expenses']);
                }
                
                // Handle existing attachment IDs
                $keepAttachmentIds = [];
                if (isset($postData['existing_attachment_ids'])) {
                    $existingAttachmentIds = json_decode($postData['existing_attachment_ids'], true);
                    
                    if (is_array($existingAttachmentIds) && !empty($existingAttachmentIds)) {
                        $keepAttachmentIds = $existingAttachmentIds;
                    }
                }
                
                // Delete attachments that are not in the keep list
                if (!empty($keepAttachmentIds)) {
                    $placeholders = implode(',', array_fill(0, count($keepAttachmentIds), '?'));
                    $query = "DELETE FROM task_submission_attachments 
                              WHERE submission_id = ? AND id NOT IN ($placeholders)";
                    
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(1, $submissionId);
                    
                    foreach ($keepAttachmentIds as $index => $id) {
                        $stmt->bindParam($index + 2, $id);
                    }
                    
                    $stmt->execute();
                } else {
                    // If no attachments to keep, delete all
                    $query = "DELETE FROM task_submission_attachments WHERE submission_id = :submission_id";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':submission_id', $submissionId);
                    $stmt->execute();
                }
                
                // Process file attachments if any
                if (isset($files['attachments']) && !empty($files['attachments'])) {
                    // Check if it's a single file or multiple files
                    if (isset($files['attachments']['name']) && !is_array($files['attachments']['name'])) {
                        // Single file
                        $this->processAttachments($submissionId, [$files['attachments']]);
                    } else {
                        // Multiple files
                        $attachments = [];
                        $fileCount = count($files['attachments']['name']);
                        
                        for ($i = 0; $i < $fileCount; $i++) {
                            $attachments[] = [
                                'name' => $files['attachments']['name'][$i],
                                'type' => $files['attachments']['type'][$i],
                                'tmp_name' => $files['attachments']['tmp_name'][$i],
                                'error' => $files['attachments']['error'][$i],
                                'size' => $files['attachments']['size'][$i]
                            ];
                        }
                        
                        $this->processAttachments($submissionId, $attachments);
                    }
                }
                
                // Process manual attachments if any
                if (isset($postData['manual_attachments'])) {
                    $manualAttachments = json_decode($postData['manual_attachments'], true);
                    
                    if (is_array($manualAttachments) && !empty($manualAttachments)) {
                        foreach ($manualAttachments as $attachmentName) {
                            // Insert manual attachment record
                            $query = "INSERT INTO task_submission_attachments 
                                      (submission_id, filename, file_path, file_type, file_size, created_at) 
                                      VALUES 
                                      (:submission_id, :filename, :file_path, :file_type, :file_size, NOW())";
                            
                            $stmt = $db->prepare($query);
                            
                            // Prepare data
                            $filename = htmlspecialchars(strip_tags($attachmentName));
                            $filePath = 'manual_attachment';
                            $fileType = 'text/plain';
                            $fileSize = 0;
                            
                            // Bind parameters
                            $stmt->bindParam(':submission_id', $submissionId);
                            $stmt->bindParam(':filename', $filename);
                            $stmt->bindParam(':file_path', $filePath);
                            $stmt->bindParam(':file_type', $fileType);
                            $stmt->bindParam(':file_size', $fileSize);
                            
                            // Execute query
                            $stmt->execute();
                        }
                    }
                }
                
                // Commit transaction
                $db->commit();
                
                return [
                    "status" => "success",
                    "message" => "Task submission updated successfully",
                    "data" => [
                        "submission_id" => $submissionId
                    ]
                ];
            } catch (Exception $e) {
                // Rollback transaction on error
                $db->rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            return [
                "status" => "error",
                "message" => "Failed to update task submission: " . $e->getMessage()
            ];
        }
    }
    
    // Get submissions for a task
    public function getSubmissions($taskId) {
        try {
            // Validate task ID
            if (!$taskId) {
                return [
                    "status" => "error",
                    "message" => "Task ID is required"
                ];
            }
            
            // Get submissions
            $query = "SELECT * FROM task_submissions WHERE task_id = :task_id ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':task_id', $taskId);
            $stmt->execute();
            
            $submissions = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // Get expenses for this submission
                $expensesQuery = "SELECT * FROM task_submission_expenses WHERE submission_id = :submission_id";
                $expensesStmt = $this->db->prepare($expensesQuery);
                $expensesStmt->bindParam(':submission_id', $row['id']);
                $expensesStmt->execute();
                
                $expenses = $expensesStmt->fetchAll(PDO::FETCH_ASSOC);
                $row['expenses'] = $expenses;
                $row['expenses_data'] = $expenses; // For backward compatibility
                
                // Get attachments for this submission
                $attachmentsQuery = "SELECT * FROM task_submission_attachments WHERE submission_id = :submission_id";
                $attachmentsStmt = $this->db->prepare($attachmentsQuery);
                $attachmentsStmt->bindParam(':submission_id', $row['id']);
                $attachmentsStmt->execute();
                
                $attachments = $attachmentsStmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Add file URLs to attachments
                foreach ($attachments as &$attachment) {
                    if ($attachment['file_path'] !== 'manual_attachment') {
                        $attachment['file_url'] = $this->getBaseUrl() . '/' . $attachment['file_path'];
                    }
                }
                
                $row['attachments'] = $attachments;
                
                $submissions[] = $row;
            }
            
            return [
                "status" => "success",
                "message" => "Submissions retrieved successfully",
                "data" => $submissions
            ];
        } catch (Exception $e) {
            return [
                "status" => "error",
                "message" => "Failed to get submissions: " . $e->getMessage()
            ];
        }
    }
    
    // Get submission by ID
    public function getSubmissionById($submissionId) {
        try {
            // Validate submission ID
            if (!$submissionId) {
                return [
                    "status" => "error",
                    "message" => "Submission ID is required"
                ];
            }
            
            // Get submission details
            $query = "SELECT * FROM task_submissions WHERE id = :submission_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':submission_id', $submissionId);
            $stmt->execute();
            
            $submission = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$submission) {
                return [
                    "status" => "error",
                    "message" => "Submission not found"
                ];
            }
            
            // Get expenses
            $query = "SELECT * FROM task_submission_expenses WHERE submission_id = :submission_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':submission_id', $submissionId);
            $stmt->execute();
            
            $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Add expenses directly to the submission object
            $submission['expenses'] = $expenses;
            
            // Also add expenses_data for backward compatibility
            $submission['expenses_data'] = $expenses;
            
            // Get attachments
            $query = "SELECT * FROM task_submission_attachments WHERE submission_id = :submission_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':submission_id', $submissionId);
            $stmt->execute();
            
            $attachments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Add file URLs to attachments
            foreach ($attachments as &$attachment) {
                if ($attachment['file_path'] !== 'manual_attachment') {
                    $attachment['file_url'] = $this->getBaseUrl() . '/' . $attachment['file_path'];
                }
            }
            
            $submission['attachments'] = $attachments;
            
            return [
                "status" => "success",
                "message" => "Submission details retrieved successfully",
                "data" => $submission
            ];
        } catch (Exception $e) {
            return [
                "status" => "error",
                "message" => "Failed to get submission details: " . $e->getMessage()
            ];
        }
    }
    
    // Helper function to get base URL
    private function getBaseUrl() {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        return $protocol . '://' . $host;
    }
    
    // Update submission status
    public function updateSubmissionStatus($submissionId, $status) {
        try {
            $query = "UPDATE task_submissions SET status = :status, updated_at = NOW() WHERE id = :submission_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':submission_id', $submissionId);
            $stmt->execute();
            
            return [
                "status" => "success",
                "message" => "Submission status updated successfully"
            ];
        } catch (Exception $e) {
            return [
                "status" => "error",
                "message" => "Failed to update submission status: " . $e->getMessage()
            ];
        }
    }
    
    // Delete submission
    public function deleteSubmission($submissionId) {
        try {
            // Start transaction
            $this->db->beginTransaction();
            
            try {
                // Delete attachments
                $query = "DELETE FROM task_submission_attachments WHERE submission_id = :submission_id";
                $stmt = $this->db->prepare($query);
                $stmt->bindParam(':submission_id', $submissionId);
                $stmt->execute();
                
                // Delete submission
                $query = "DELETE FROM task_submissions WHERE id = :submission_id";
                $stmt = $this->db->prepare($query);
                $stmt->bindParam(':submission_id', $submissionId);
                $stmt->execute();
                
                // Commit transaction
                $this->db->commit();
                
                return [
                    "status" => "success",
                    "message" => "Submission deleted successfully"
                ];
            } catch (Exception $e) {
                // Rollback transaction on error
                $this->db->rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            return [
                "status" => "error",
                "message" => "Failed to delete submission: " . $e->getMessage()
            ];
        }
    }
    
    // Delete submission attachment
    public function deleteSubmissionAttachment($attachmentId) {
        try {
            // Get attachment details
            $query = "SELECT * FROM task_submission_attachments WHERE id = :attachment_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':attachment_id', $attachmentId);
            $stmt->execute();
            
            $attachment = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$attachment) {
                return [
                    "status" => "error",
                    "message" => "Attachment not found"
                ];
            }
            
            // Delete file if exists
            if (file_exists($attachment['file_path'])) {
                unlink($attachment['file_path']);
            }
            
            // Delete attachment record
            $query = "DELETE FROM task_submission_attachments WHERE id = :attachment_id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':attachment_id', $attachmentId);
            $stmt->execute();
            
            return [
                "status" => "success",
                "message" => "Attachment deleted successfully"
            ];
        } catch (Exception $e) {
            return [
                "status" => "error",
                "message" => "Failed to delete attachment: " . $e->getMessage()
            ];
        }
    }
    
    // Get liaison submissions
    public function getLiaisonSubmissions($liaisonId) {
        try {
            $query = "SELECT ts.*, t.description as task_description
                      FROM task_submissions ts
                      JOIN tasks t ON ts.task_id = t.id
                      WHERE ts.liaison_id = :liaison_id
                      ORDER BY ts.created_at DESC";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':liaison_id', $liaisonId);
            $stmt->execute();
            
            $submissions = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $submissions[] = $row;
            }
            
            return [
                "status" => "success",
                "data" => $submissions
            ];
        } catch (Exception $e) {
            return [
                "status" => "error",
                "message" => "Failed to get liaison submissions: " . $e->getMessage()
            ];
        }
    }
}
?> 