<?php

class JobOrder {
    private $conn;
    private $table = 'job_orders';

    // Properties matching the database columns
    public $job_order_id;
    public $service_id;
    public $proposal_id;
    public $description;
    public $estimated_fee;
    public $status;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create job order
    public function create() {
        $query = "INSERT INTO " . $this->table . "
                (service_id, proposal_id, description, estimated_fee, status)
                VALUES
                (:service_id, :proposal_id, :description, :estimated_fee, :status)";

        $stmt = $this->conn->prepare($query);

        // Clean and bind data
        $this->service_id = htmlspecialchars(strip_tags($this->service_id));
        $this->proposal_id = htmlspecialchars(strip_tags($this->proposal_id));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->estimated_fee = htmlspecialchars(strip_tags($this->estimated_fee));
        $this->status = htmlspecialchars(strip_tags($this->status));

        $stmt->bindParam(':service_id', $this->service_id);
        $stmt->bindParam(':proposal_id', $this->proposal_id);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':estimated_fee', $this->estimated_fee);
        $stmt->bindParam(':status', $this->status);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Get job orders by service and proposal
    public function getByService($serviceId, $proposalId) {
        $query = "SELECT * FROM " . $this->table . "
                 WHERE service_id = :service_id 
                 AND proposal_id = :proposal_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':service_id', $serviceId);
        $stmt->bindParam(':proposal_id', $proposalId);
        $stmt->execute();

        return $stmt;
    }

    // Update job order
    public function update() {
        $query = "UPDATE " . $this->table . "
                SET description = :description,
                    estimated_fee = :estimated_fee,
                    status = :status,
                    updated_at = CURRENT_TIMESTAMP
                WHERE job_order_id = :job_order_id";

        $stmt = $this->conn->prepare($query);

        // Clean and bind data
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->estimated_fee = htmlspecialchars(strip_tags($this->estimated_fee));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->job_order_id = htmlspecialchars(strip_tags($this->job_order_id));

        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':estimated_fee', $this->estimated_fee);
        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':job_order_id', $this->job_order_id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Delete job order
    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE job_order_id = :job_order_id";
        $stmt = $this->conn->prepare($query);

        $this->job_order_id = htmlspecialchars(strip_tags($this->job_order_id));
        $stmt->bindParam(':job_order_id', $this->job_order_id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
} 