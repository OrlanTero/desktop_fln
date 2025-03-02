<?php
class ServiceRequirement {
    // Database connection and table name
    private $conn;
    private $table_name = "service_requirements";
    
    // Object properties
    public $requirement_id;
    public $service_id;
    public $requirement;
    public $created_at;
    public $updated_at;
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all requirements for a service
    public function getByServiceId($serviceId) {
        $query = "SELECT requirement_id, service_id, requirement, created_at, updated_at 
                  FROM " . $this->table_name . " 
                  WHERE service_id = :service_id
                  ORDER BY requirement_id ASC";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $serviceId = htmlspecialchars(strip_tags($serviceId));
        $stmt->bindParam(":service_id", $serviceId);
        
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get single requirement by ID
    public function getById() {
        $query = "SELECT requirement_id, service_id, requirement, created_at, updated_at 
                  FROM " . $this->table_name . " 
                  WHERE requirement_id = :requirement_id 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->requirement_id = htmlspecialchars(strip_tags($this->requirement_id));
        $stmt->bindParam(":requirement_id", $this->requirement_id);
        
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            // Set properties
            $this->requirement_id = $row['requirement_id'];
            $this->service_id = $row['service_id'];
            $this->requirement = $row['requirement'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            return true;
        }
        
        return false;
    }
    
    // Create requirement
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET 
                    service_id = :service_id,
                    requirement = :requirement,
                    created_at = NOW(), 
                    updated_at = NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->service_id = htmlspecialchars(strip_tags($this->service_id));
        $this->requirement = htmlspecialchars(strip_tags($this->requirement));
        
        // Bind parameters
        $stmt->bindParam(":service_id", $this->service_id);
        $stmt->bindParam(":requirement", $this->requirement);
        
        // Execute query
        if($stmt->execute()) {
            $this->requirement_id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Update requirement
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET 
                    service_id = :service_id,
                    requirement = :requirement,
                    updated_at = NOW() 
                  WHERE 
                    requirement_id = :requirement_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->requirement_id = htmlspecialchars(strip_tags($this->requirement_id));
        $this->service_id = htmlspecialchars(strip_tags($this->service_id));
        $this->requirement = htmlspecialchars(strip_tags($this->requirement));
        
        // Bind parameters
        $stmt->bindParam(":requirement_id", $this->requirement_id);
        $stmt->bindParam(":service_id", $this->service_id);
        $stmt->bindParam(":requirement", $this->requirement);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Delete requirement
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE requirement_id = :requirement_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->requirement_id = htmlspecialchars(strip_tags($this->requirement_id));
        $stmt->bindParam(":requirement_id", $this->requirement_id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Delete all requirements for a service
    public function deleteByServiceId($serviceId) {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE service_id = :service_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $serviceId = htmlspecialchars(strip_tags($serviceId));
        $stmt->bindParam(":service_id", $serviceId);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
} 