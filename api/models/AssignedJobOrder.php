<?php
class AssignedJobOrder {
    private $conn;
    private $table_name = "assigned_job_orders";

    public $id;
    public $job_order_id;
    public $liaison_id;
    public $assigned_date;
    public $status;
    public $notes;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create new assignment
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                (job_order_id, liaison_id, status, notes) 
                VALUES 
                (:job_order_id, :liaison_id, :status, :notes)";

        $stmt = $this->conn->prepare($query);

        // Sanitize inputs
        $this->job_order_id = htmlspecialchars(strip_tags($this->job_order_id));
        $this->liaison_id = htmlspecialchars(strip_tags($this->liaison_id));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->notes = htmlspecialchars(strip_tags($this->notes));

        // Bind values
        $stmt->bindParam(":job_order_id", $this->job_order_id);
        $stmt->bindParam(":liaison_id", $this->liaison_id);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":notes", $this->notes);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Get assignments by project ID
    public function getByProject($project_id) {
        // Get assigned job orders using the is_assigned column
        $query = "SELECT jo.*, u.name as liaison_name 
                FROM job_orders jo
                JOIN " . $this->table_name . " ajo ON jo.job_order_id = ajo.job_order_id
                JOIN users u ON ajo.liaison_id = u.id
                WHERE jo.project_id = :project_id 
                AND jo.is_assigned = 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":project_id", $project_id);
        $stmt->execute();

        return $stmt;
    }

    // Get unassigned job orders by project ID
    public function getUnassignedByProject($project_id) {
        // Use the is_assigned column to find unassigned job orders
        $query = "SELECT * FROM job_orders 
                WHERE project_id = :project_id 
                AND (is_assigned = 0 OR is_assigned IS NULL)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":project_id", $project_id);
        $stmt->execute();

        return $stmt;
    }

    // Update status
    public function updateStatus() {
        // Prepare query
        $query = "UPDATE " . $this->table_name . "
                SET status = :status, 
                    notes = :notes
                WHERE job_order_id = :job_order_id";

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Clean data
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->notes = htmlspecialchars(strip_tags($this->notes));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind data
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":job_order_id", $this->id);

        // Execute query
        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Delete assignment
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Get table name
    public function getTableName() {
        return $this->table_name;
    }

    // Update status of an assigned job order (new implementation)
    public function updateJobOrderStatus($id, $status) {
        try {
            $query = "UPDATE " . $this->table_name . " 
                    SET status = :status
                    WHERE job_order_id = :id";

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
            throw new Exception("Error updating status: " . $e->getMessage());
        }
    }
} 