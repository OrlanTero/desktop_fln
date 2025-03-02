<?php
class ServiceCategory {
    // Database connection and table name
    private $conn;
    private $table_name = "service_categories";
    
    // Object properties
    public $service_category_id;
    public $service_category_name;
    public $priority_number;
    public $added_by_id;
    public $description;
    public $created_at;
    public $updated_at;
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all service categories
    public function getAll() {
        $query = "SELECT sc.service_category_id, sc.service_category_name, sc.priority_number, 
                         sc.added_by_id, sc.description, sc.created_at, sc.updated_at,
                         u.name as added_by_name
                  FROM " . $this->table_name . " sc
                  LEFT JOIN users u ON sc.added_by_id = u.id
                  ORDER BY sc.priority_number ASC, sc.service_category_name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get single service category by ID
    public function getById() {
        $query = "SELECT sc.service_category_id, sc.service_category_name, sc.priority_number, 
                         sc.added_by_id, sc.description, sc.created_at, sc.updated_at,
                         u.name as added_by_name
                  FROM " . $this->table_name . " sc
                  LEFT JOIN users u ON sc.added_by_id = u.id
                  WHERE sc.service_category_id = :service_category_id 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->service_category_id = htmlspecialchars(strip_tags($this->service_category_id));
        $stmt->bindParam(":service_category_id", $this->service_category_id);
        
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            // Set properties
            $this->service_category_id = $row['service_category_id'];
            $this->service_category_name = $row['service_category_name'];
            $this->priority_number = $row['priority_number'];
            $this->added_by_id = $row['added_by_id'];
            $this->description = $row['description'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            return true;
        }
        
        return false;
    }
    
    // Create service category
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET 
                    service_category_name = :service_category_name, 
                    priority_number = :priority_number,
                    added_by_id = :added_by_id,
                    description = :description,
                    created_at = NOW(), 
                    updated_at = NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->service_category_name = htmlspecialchars(strip_tags($this->service_category_name));
        $this->priority_number = htmlspecialchars(strip_tags($this->priority_number));
        $this->added_by_id = htmlspecialchars(strip_tags($this->added_by_id));
        $this->description = htmlspecialchars(strip_tags($this->description));
        
        // Bind parameters
        $stmt->bindParam(":service_category_name", $this->service_category_name);
        $stmt->bindParam(":priority_number", $this->priority_number);
        $stmt->bindParam(":added_by_id", $this->added_by_id);
        $stmt->bindParam(":description", $this->description);
        
        // Execute query
        if($stmt->execute()) {
            $this->service_category_id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Update service category
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET 
                    service_category_name = :service_category_name, 
                    priority_number = :priority_number,
                    added_by_id = :added_by_id,
                    description = :description,
                    updated_at = NOW() 
                  WHERE 
                    service_category_id = :service_category_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->service_category_id = htmlspecialchars(strip_tags($this->service_category_id));
        $this->service_category_name = htmlspecialchars(strip_tags($this->service_category_name));
        $this->priority_number = htmlspecialchars(strip_tags($this->priority_number));
        $this->added_by_id = htmlspecialchars(strip_tags($this->added_by_id));
        $this->description = htmlspecialchars(strip_tags($this->description));
        
        // Bind parameters
        $stmt->bindParam(":service_category_id", $this->service_category_id);
        $stmt->bindParam(":service_category_name", $this->service_category_name);
        $stmt->bindParam(":priority_number", $this->priority_number);
        $stmt->bindParam(":added_by_id", $this->added_by_id);
        $stmt->bindParam(":description", $this->description);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Delete service category
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE service_category_id = :service_category_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->service_category_id = htmlspecialchars(strip_tags($this->service_category_id));
        $stmt->bindParam(":service_category_id", $this->service_category_id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Check if service category name exists
    public function categoryNameExists() {
        $query = "SELECT service_category_id, service_category_name 
                  FROM " . $this->table_name . " 
                  WHERE service_category_name = :service_category_name";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->service_category_name = htmlspecialchars(strip_tags($this->service_category_name));
        $stmt->bindParam(":service_category_name", $this->service_category_name);
        
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
} 