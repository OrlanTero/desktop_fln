<?php
require_once 'models/JobOrderSubmission.php';
require_once 'controllers/JobOrderController.php';
require_once 'controllers/AssignedJobOrderController.php';

class JobOrderSubmissionController
{
    private $jobOrderSubmission;
    private $conn;
    private $upload_dir;

    public function __construct($db)
    {
        $this->conn = $db;
        $this->jobOrderSubmission = new JobOrderSubmission($db);

        // Set upload directory
        $this->upload_dir = $_SERVER['DOCUMENT_ROOT'] . '/uploads/job_orders/';

        // Create upload directory if it doesn't exist
        if (!file_exists($this->upload_dir)) {
            mkdir($this->upload_dir, 0777, true);
        }
    }

    // Create a new job order submission
    public function create($data)
    {
        try {
            // Validate required fields
            if (!isset($data->job_order_id) || !isset($data->liaison_id) || !isset($data->expenses)) {
                return [
                    'success' => false,
                    'message' => 'Missing required fields'
                ];
            }

            // Check if this is an update to an existing submission
            $isUpdate = isset($data->is_update) && $data->is_update === 'true';
            $submissionId = isset($data->submission_id) ? $data->submission_id : null;

            // Calculate total expenses
            $total_expenses = 0;
            foreach ($data->expenses as $expense) {
                $total_expenses += floatval($expense->amount);
            }

            // Start transaction
            $this->conn->beginTransaction();

            if ($isUpdate && $submissionId) {
                // Update existing submission
                $this->jobOrderSubmission->updateSubmission(
                    $submissionId,
                    $data->notes ?? '',
                    $total_expenses
                );

                // Delete existing expenses for this submission
                $this->jobOrderSubmission->deleteExpenses($submissionId);

                // Re-add all expenses
                foreach ($data->expenses as $expense) {
                    $this->jobOrderSubmission->addExpense(
                        $submissionId,
                        $expense->description,
                        $expense->amount
                    );
                }

                // Handle attachments
                $this->handleAttachmentsUpdate($submissionId, $data);
            } else {
                // Create new submission
                $submissionId = $this->jobOrderSubmission->create(
                    $data->liaison_id,
                    $data->job_order_id,
                    $data->notes ?? '',
                    $total_expenses
                );

                if (!$submissionId) {
                    throw new Exception("Failed to create submission");
                }

                // Add expenses
                foreach ($data->expenses as $expense) {
                    $this->jobOrderSubmission->addExpense(
                        $submissionId,
                        $expense->description,
                        $expense->amount
                    );
                }

                // Process attachments if any
                if (isset($_FILES['attachments'])) {
                    $this->processAttachments($submissionId, $_FILES['attachments']);
                }

                // Process manual attachments if any
                if (isset($data->manual_attachments)) {
                    $this->processManualAttachments($submissionId, $data->manual_attachments);
                }
            }

            // Update job order status if requested
            if (isset($data->update_job_order_status) && $data->update_job_order_status === 'true') {
                // Get the job order controller
                $jobOrderController = new JobOrderController($this->conn);

                // Update the job order status to Submitted
                $jobOrderController->updateStatus($data->job_order_id, 'SUBMITTED');

                // Also update the assigned job order status
                $assignedJobOrderController = new AssignedJobOrderController($this->conn);
                $assignedJobOrderController->updateStatus($data->job_order_id, ['status' => 'SUBMITTED']);
            }

            // Commit transaction
            $this->conn->commit();

            // Get the created/updated submission with all details
            $submission = $this->jobOrderSubmission->getById($submissionId);

            return [
                'success' => true,
                'message' => $isUpdate ? 'Job order submission updated successfully' : 'Job order submission created successfully',
                'data' => $submission
            ];
        } catch (Exception $e) {
            // Rollback transaction on error
            $this->conn->rollBack();

            // Define isUpdate if it's not set (in case the error happens before it's defined)
            if (!isset($isUpdate)) {
                $isUpdate = isset($data->is_update) && $data->is_update === 'true';
            }

            return [
                'success' => false,
                'message' => 'Error ' . ($isUpdate ? 'updating' : 'creating') . ' job order submission: ' . $e->getMessage()
            ];
        }
    }

    // Handle attachments update
    private function handleAttachmentsUpdate($submissionId, $data)
    {
        try {
            // Get existing attachment IDs to keep
            $existingAttachmentIds = [];
            if (isset($data->existing_attachment_ids)) {
                $existingAttachmentIds = json_decode($data->existing_attachment_ids);
            }

            // Delete attachments not in the existing_attachment_ids list
            $this->jobOrderSubmission->deleteAttachmentsExcept($submissionId, $existingAttachmentIds);

            // Process new attachments if any
            if (isset($_FILES['attachments'])) {
                $this->processAttachments($submissionId, $_FILES['attachments']);
            }

            // Process manual attachments if any
            if (isset($data->manual_attachments)) {
                $this->processManualAttachments($submissionId, $data->manual_attachments);
            }

            return true;
        } catch (Exception $e) {
            throw new Exception("Error handling attachments update: " . $e->getMessage());
        }
    }

    // Process manual attachments
    private function processManualAttachments($submissionId, $manualAttachmentsJson)
    {
        try {
            $manualAttachments = json_decode($manualAttachmentsJson);

            if (is_array($manualAttachments)) {
                foreach ($manualAttachments as $attachmentName) {
                    // Add a manual attachment record
                    $this->jobOrderSubmission->addAttachment(
                        $submissionId,
                        $attachmentName,
                        'manual_attachment',
                        'text/plain',
                        0
                    );
                }
            }

            return true;
        } catch (Exception $e) {
            throw new Exception("Error processing manual attachments: " . $e->getMessage());
        }
    }

    // Process file attachments
    private function processAttachments($submission_id, $files)
    {
        // If single file
        if (!is_array($files['name'])) {
            $this->processFile($submission_id, $files);
            return;
        }

        // If multiple files
        $file_count = count($files['name']);
        for ($i = 0; $i < $file_count; $i++) {
            if ($files['error'][$i] === UPLOAD_ERR_OK) {
                $temp_file = [
                    'name' => $files['name'][$i],
                    'type' => $files['type'][$i],
                    'tmp_name' => $files['tmp_name'][$i],
                    'error' => $files['error'][$i],
                    'size' => $files['size'][$i]
                ];
                $this->processFile($submission_id, $temp_file);
            }
        }
    }

    // Process a single file
    private function processFile($submission_id, $file)
    {
        // Check if file was uploaded without errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("File upload error: " . $this->getUploadErrorMessage($file['error']));
        }

        // Generate unique filename
        $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $new_filename = uniqid() . '_' . time() . '.' . $file_extension;
        $file_path = 'uploads/job_orders/' . $new_filename;
        $full_path = $this->upload_dir . $new_filename;

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $full_path)) {
            throw new Exception("Failed to move uploaded file");
        }

        // Add attachment record to database
        $this->jobOrderSubmission->addAttachment(
            $submission_id,
            $file['name'],
            $file_path,
            $file['type'],
            $file['size']
        );
    }

    // Get upload error message
    private function getUploadErrorMessage($error_code)
    {
        switch ($error_code) {
            case UPLOAD_ERR_INI_SIZE:
                return "The uploaded file exceeds the upload_max_filesize directive in php.ini";
            case UPLOAD_ERR_FORM_SIZE:
                return "The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form";
            case UPLOAD_ERR_PARTIAL:
                return "The uploaded file was only partially uploaded";
            case UPLOAD_ERR_NO_FILE:
                return "No file was uploaded";
            case UPLOAD_ERR_NO_TMP_DIR:
                return "Missing a temporary folder";
            case UPLOAD_ERR_CANT_WRITE:
                return "Failed to write file to disk";
            case UPLOAD_ERR_EXTENSION:
                return "A PHP extension stopped the file upload";
            default:
                return "Unknown upload error";
        }
    }

    // Get submission by ID
    public function getById($id)
    {
        try {
            $submission = $this->jobOrderSubmission->getById($id);

            if (!$submission) {
                return [
                    'success' => false,
                    'message' => 'Submission not found'
                ];
            }

            return [
                'success' => true,
                'data' => $submission
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error retrieving submission: ' . $e->getMessage()
            ];
        }
    }

    // Get submissions by job order ID
    public function getByJobOrderId($job_order_id)
    {
        try {
            // Query to get submissions for this job order
            $query = "SELECT * FROM " . $this->jobOrderSubmission->getTableName() . " 
                    WHERE job_order_id = :job_order_id
                    ORDER BY created_at DESC";

            // Prepare statement
            $stmt = $this->conn->prepare($query);

            // Bind job order ID
            $stmt->bindParam(":job_order_id", $job_order_id);

            // Execute query
            $stmt->execute();

            $submissions = [];

            // Fetch all submissions
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // Get full submission details including expenses and attachments
                $submission = $this->jobOrderSubmission->getById($row['id']);
                if ($submission) {
                    $submissions[] = $submission;
                }
            }

            return [
                'success' => true,
                'data' => $submissions
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error retrieving submissions: ' . $e->getMessage()
            ];
        }
    }

    // Get submissions by liaison ID
    public function getByLiaisonId($liaison_id)
    {
        try {
            $stmt = $this->jobOrderSubmission->getByLiaisonId($liaison_id);
            $submissions = [];

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $submissions[] = $row;
            }

            return [
                'success' => true,
                'data' => $submissions
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error retrieving submissions: ' . $e->getMessage()
            ];
        }
    }

    // Update submission status
    public function updateStatus($id, $status)
    {
        try {
            // Validate status
            $valid_statuses = ['pending', 'approved', 'rejected'];
            if (!in_array($status, $valid_statuses)) {
                return [
                    'success' => false,
                    'message' => 'Invalid status. Must be one of: ' . implode(', ', $valid_statuses)
                ];
            }

            $result = $this->jobOrderSubmission->updateStatus($id, $status);

            if (!$result) {
                return [
                    'success' => false,
                    'message' => 'Failed to update submission status'
                ];
            }

            return [
                'success' => true,
                'message' => 'Submission status updated successfully'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error updating submission status: ' . $e->getMessage()
            ];
        }
    }

    // Delete a submission
    public function delete($id)
    {
        try {
            // Get submission to check if it exists and get attachment paths
            $submission = $this->jobOrderSubmission->getById($id);

            if (!$submission) {
                return [
                    'success' => false,
                    'message' => 'Submission not found'
                ];
            }

            // Delete attachment files
            if (isset($submission['attachments']) && is_array($submission['attachments'])) {
                foreach ($submission['attachments'] as $attachment) {
                    $file_path = $_SERVER['DOCUMENT_ROOT'] . '/' . $attachment['file_path'];
                    if (file_exists($file_path)) {
                        unlink($file_path);
                    }
                }
            }

            // Delete submission from database
            $result = $this->jobOrderSubmission->delete($id);

            if (!$result) {
                return [
                    'success' => false,
                    'message' => 'Failed to delete submission'
                ];
            }

            return [
                'success' => true,
                'message' => 'Submission deleted successfully'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error deleting submission: ' . $e->getMessage()
            ];
        }
    }

    // Delete an attachment
    public function deleteAttachment($id)
    {
        try {
            $result = $this->jobOrderSubmission->deleteAttachment($id);

            if ($result) {
                return [
                    'success' => true,
                    'message' => 'Attachment deleted successfully'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to delete attachment'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error deleting attachment: ' . $e->getMessage()
            ];
        }
    }
}