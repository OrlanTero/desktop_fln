<?php
class JobOrderSubmission
{
    // Database connection and table name
    private $conn;
    private $table_name = "job_order_submissions";
    private $expenses_table = "job_order_submission_expenses";
    private $attachments_table = "job_order_submission_attachments";

    // Object properties
    public $id;
    public $job_order_id;
    public $liaison_id;
    public $notes;
    public $total_expenses;
    public $status;
    public $created_at;
    public $updated_at;

    // Constructor with database connection
    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Create a new submission
    public function create($liaison_id, $job_order_id, $notes, $total_expenses)
    {
        try {
            // Insert query
            $query = "INSERT INTO " . $this->table_name . " 
                    (liaison_id, job_order_id, notes, total_expenses, status) 
                    VALUES (:liaison_id, :job_order_id, :notes, :total_expenses, :status)";

            // Prepare statement
            $stmt = $this->conn->prepare($query);

            // Sanitize and bind values
            $liaison_id = htmlspecialchars(strip_tags($liaison_id));
            $job_order_id = htmlspecialchars(strip_tags($job_order_id));
            $notes = htmlspecialchars(strip_tags($notes));
            $total_expenses = htmlspecialchars(strip_tags($total_expenses));
            $status = htmlspecialchars(strip_tags("Submitted"));

            $stmt->bindParam(":liaison_id", $liaison_id);
            $stmt->bindParam(":job_order_id", $job_order_id);
            $stmt->bindParam(":notes", $notes);
            $stmt->bindParam(":total_expenses", $total_expenses);
            $stmt->bindParam(":status", $status);

            // Execute query
            if ($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            return false;
        } catch (Exception $e) {
            throw new Exception("Error creating submission: " . $e->getMessage());
        }
    }

    // Add an expense to a submission
    public function addExpense($submission_id, $description, $amount)
    {
        try {
            // Insert query
            $query = "INSERT INTO " . $this->expenses_table . " 
                    (submission_id, description, amount) 
                    VALUES (:submission_id, :description, :amount)";

            // Prepare statement
            $stmt = $this->conn->prepare($query);

            // Sanitize and bind values
            $submission_id = htmlspecialchars(strip_tags($submission_id));
            $description = htmlspecialchars(strip_tags($description));
            $amount = htmlspecialchars(strip_tags($amount));

            $stmt->bindParam(":submission_id", $submission_id);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":amount", $amount);

            // Execute query
            if ($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            return false;
        } catch (Exception $e) {
            throw new Exception("Error adding expense: " . $e->getMessage());
        }
    }

    // Add an attachment to a submission
    public function addAttachment($submission_id, $file_name, $file_path, $file_type, $file_size)
    {
        try {
            // Insert query
            $query = "INSERT INTO " . $this->attachments_table . " 
                    (submission_id, file_name, file_path, file_type, file_size) 
                    VALUES (:submission_id, :file_name, :file_path, :file_type, :file_size)";

            // Prepare statement
            $stmt = $this->conn->prepare($query);

            // Sanitize and bind values
            $submission_id = htmlspecialchars(strip_tags($submission_id));
            $file_name = htmlspecialchars(strip_tags($file_name));
            $file_path = htmlspecialchars(strip_tags($file_path));
            $file_type = htmlspecialchars(strip_tags($file_type));
            $file_size = htmlspecialchars(strip_tags($file_size));

            $stmt->bindParam(":submission_id", $submission_id);
            $stmt->bindParam(":file_name", $file_name);
            $stmt->bindParam(":file_path", $file_path);
            $stmt->bindParam(":file_type", $file_type);
            $stmt->bindParam(":file_size", $file_size);

            // Execute query
            if ($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            return false;
        } catch (Exception $e) {
            throw new Exception("Error adding attachment: " . $e->getMessage());
        }
    }

    // Get submission by ID with expenses and attachments
    public function getById($id)
    {
        try {
            // Query to get submission
            $query = "SELECT s.*, jo.description as job_order_title, u.name as liaison_name 
                    FROM " . $this->table_name . " s
                    LEFT JOIN job_orders jo ON s.job_order_id = jo.job_order_id
                    LEFT JOIN users u ON s.liaison_id = u.id
                    WHERE s.id = :id";

            // Prepare statement
            $stmt = $this->conn->prepare($query);

            // Bind ID
            $stmt->bindParam(":id", $id);

            // Execute query
            $stmt->execute();
            $submission = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$submission) {
                return null;
            }

            // Get expenses
            $query = "SELECT * FROM " . $this->expenses_table . " WHERE submission_id = :submission_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":submission_id", $id);
            $stmt->execute();
            $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Add expenses to submission
            $submission['expenses'] = $expenses;

            // Get attachments
            $query = "SELECT * FROM " . $this->attachments_table . " WHERE submission_id = :submission_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":submission_id", $id);
            $stmt->execute();
            $attachments = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Add attachments to submission
            $submission['attachments'] = $attachments;

            return $submission;
        } catch (Exception $e) {
            throw new Exception("Error retrieving submission: " . $e->getMessage());
        }
    }

    // Get submissions by job order ID
    public function getByJobOrderId($job_order_id)
    {
        try {
            // Query to get submissions
            $query = "SELECT s.*, u.name as liaison_name 
                    FROM " . $this->table_name . " s
                    LEFT JOIN users u ON s.liaison_id = u.id
                    WHERE s.job_order_id = :job_order_id
                    ORDER BY s.created_at DESC";

            // Prepare statement
            $stmt = $this->conn->prepare($query);

            // Bind job order ID
            $stmt->bindParam(":job_order_id", $job_order_id);

            // Execute query
            $stmt->execute();

            return $stmt;
        } catch (Exception $e) {
            throw new Exception("Error retrieving submissions: " . $e->getMessage());
        }
    }

    // Get submissions by liaison ID
    public function getByLiaisonId($liaison_id)
    {
        try {
            // Query to get submissions
            $query = "SELECT s.*, jo.title as job_order_title 
                    FROM " . $this->table_name . " s
                    LEFT JOIN job_orders jo ON s.job_order_id = jo.job_order_id
                    WHERE s.liaison_id = :liaison_id
                    ORDER BY s.created_at DESC";

            // Prepare statement
            $stmt = $this->conn->prepare($query);

            // Bind liaison ID
            $stmt->bindParam(":liaison_id", $liaison_id);

            // Execute query
            $stmt->execute();

            return $stmt;
        } catch (Exception $e) {
            throw new Exception("Error retrieving submissions: " . $e->getMessage());
        }
    }

    // Update submission status
    public function updateStatus($id, $status)
    {
        try {
            // Update query
            $query = "UPDATE " . $this->table_name . " 
                    SET status = :status
                    WHERE id = :id";

            // Prepare statement
            $stmt = $this->conn->prepare($query);

            // Sanitize and bind values
            $status = htmlspecialchars(strip_tags($status));
            $id = htmlspecialchars(strip_tags($id));

            $stmt->bindParam(":status", $status);
            $stmt->bindParam(":id", $id);

            // Execute query
            if ($stmt->execute()) {
                return true;
            }
            return false;
        } catch (Exception $e) {
            throw new Exception("Error updating submission status: " . $e->getMessage());
        }
    }

    // Delete a submission and its related expenses and attachments
    public function delete($id)
    {
        try {
            // Start transaction
            $this->conn->beginTransaction();

            // Delete expenses
            $query = "DELETE FROM " . $this->expenses_table . " WHERE submission_id = :submission_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":submission_id", $id);
            $stmt->execute();

            // Delete attachments
            $query = "DELETE FROM " . $this->attachments_table . " WHERE submission_id = :submission_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":submission_id", $id);
            $stmt->execute();

            // Delete submission
            $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();

            // Commit transaction
            $this->conn->commit();

            return true;
        } catch (Exception $e) {
            // Rollback transaction on error
            $this->conn->rollBack();
            throw new Exception("Error deleting submission: " . $e->getMessage());
        }
    }

    // Update an existing submission
    public function updateSubmission($id, $notes, $total_expenses)
    {
        try {
            // Update query
            $query = "UPDATE " . $this->table_name . " 
                    SET notes = :notes, total_expenses = :total_expenses, updated_at = CURRENT_TIMESTAMP
                    WHERE id = :id";

            // Prepare statement
            $stmt = $this->conn->prepare($query);

            // Sanitize and bind values
            $notes = htmlspecialchars(strip_tags($notes));
            $total_expenses = htmlspecialchars(strip_tags($total_expenses));
            $id = htmlspecialchars(strip_tags($id));

            $stmt->bindParam(":notes", $notes);
            $stmt->bindParam(":total_expenses", $total_expenses);
            $stmt->bindParam(":id", $id);

            // Execute query
            if ($stmt->execute()) {
                return true;
            }
            return false;
        } catch (Exception $e) {
            throw new Exception("Error updating submission: " . $e->getMessage());
        }
    }

    // Delete all expenses for a submission
    public function deleteExpenses($submission_id)
    {
        try {
            // Delete query
            $query = "DELETE FROM " . $this->expenses_table . " WHERE submission_id = :submission_id";

            // Prepare statement
            $stmt = $this->conn->prepare($query);

            // Sanitize and bind values
            $submission_id = htmlspecialchars(strip_tags($submission_id));
            $stmt->bindParam(":submission_id", $submission_id);

            // Execute query
            if ($stmt->execute()) {
                return true;
            }
            return false;
        } catch (Exception $e) {
            throw new Exception("Error deleting expenses: " . $e->getMessage());
        }
    }

    // Delete attachments except those with specified IDs
    public function deleteAttachmentsExcept($submission_id, $attachment_ids = [])
    {
        try {
            // If no attachment IDs provided, delete all attachments
            if (empty($attachment_ids)) {
                $query = "DELETE FROM " . $this->attachments_table . " WHERE submission_id = :submission_id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":submission_id", $submission_id);
                return $stmt->execute();
            }

            // Convert attachment IDs to string for SQL IN clause
            $attachment_ids_str = implode(',', array_map('intval', $attachment_ids));

            // Delete query with NOT IN clause
            $query = "DELETE FROM " . $this->attachments_table . " 
                    WHERE submission_id = :submission_id 
                    AND id NOT IN (" . $attachment_ids_str . ")";

            // Prepare statement
            $stmt = $this->conn->prepare($query);

            // Sanitize and bind values
            $submission_id = htmlspecialchars(strip_tags($submission_id));
            $stmt->bindParam(":submission_id", $submission_id);

            // Execute query
            if ($stmt->execute()) {
                return true;
            }
            return false;
        } catch (Exception $e) {
            throw new Exception("Error deleting attachments: " . $e->getMessage());
        }
    }

    // Delete a specific attachment
    public function deleteAttachment($attachment_id)
    {
        try {
            // Get attachment info first to delete the file
            $query = "SELECT file_path FROM " . $this->attachments_table . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $attachment_id);
            $stmt->execute();
            $attachment = $stmt->fetch(PDO::FETCH_ASSOC);

            // Delete the file if it exists and is not a manual attachment
            if ($attachment && $attachment['file_path'] !== 'manual_attachment') {
                $file_path = $_SERVER['DOCUMENT_ROOT'] . '/' . $attachment['file_path'];
                if (file_exists($file_path)) {
                    unlink($file_path);
                }
            }

            // Delete query
            $query = "DELETE FROM " . $this->attachments_table . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $attachment_id);

            // Execute query
            if ($stmt->execute()) {
                return true;
            }
            return false;
        } catch (Exception $e) {
            throw new Exception("Error deleting attachment: " . $e->getMessage());
        }
    }

    // Get table name
    public function getTableName()
    {
        return $this->table_name;
    }
}