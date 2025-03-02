<?php
class Service {
    // Database connection and table name
    private $conn;
    private $table_name = "services";
    
    // Object properties
    public $service_id;
    public $service_category_id;
    public $service_name;
    public $price;
    public $remarks;
    public $timeline;
    public $created_at;
    public $updated_at;
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all services
    public function getAll() {
        $query = "SELECT s.service_id, s.service_category_id, s.service_name, s.price, 
                         s.remarks, s.timeline, s.created_at, s.updated_at,
                         sc.service_category_name
                  FROM " . $this->table_name . " s
                  LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id
                  ORDER BY sc.priority_number ASC, s.service_name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get services by category ID
    public function getByCategory($categoryId) {
        $query = "SELECT s.service_id, s.service_category_id, s.service_name, s.price, 
                         s.remarks, s.timeline, s.created_at, s.updated_at,
                         sc.service_category_name
                  FROM " . $this->table_name . " s
                  LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id
                  WHERE s.service_category_id = :service_category_id
                  ORDER BY s.service_name ASC";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $categoryId = htmlspecialchars(strip_tags($categoryId));
        $stmt->bindParam(":service_category_id", $categoryId);
        
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get single service by ID
    public function getById() {
        $query = "SELECT s.service_id, s.service_category_id, s.service_name, s.price, 
                         s.remarks, s.timeline, s.created_at, s.updated_at,
                         sc.service_category_name
                  FROM " . $this->table_name . " s
                  LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id
                  WHERE s.service_id = :service_id 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->service_id = htmlspecialchars(strip_tags($this->service_id));
        $stmt->bindParam(":service_id", $this->service_id);
        
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            // Set properties
            $this->service_id = $row['service_id'];
            $this->service_category_id = $row['service_category_id'];
            $this->service_name = $row['service_name'];
            $this->price = $row['price'];
            $this->remarks = $row['remarks'];
            $this->timeline = $row['timeline'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            return true;
        }
        
        return false;
    }
    
    // Create service
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET 
                    service_category_id = :service_category_id,
                    service_name = :service_name, 
                    price = :price,
                    remarks = :remarks,
                    timeline = :timeline,
                    created_at = NOW(), 
                    updated_at = NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->service_category_id = htmlspecialchars(strip_tags($this->service_category_id));
        $this->service_name = htmlspecialchars(strip_tags($this->service_name));
        $this->price = htmlspecialchars(strip_tags($this->price));
        $this->remarks = htmlspecialchars(strip_tags($this->remarks));
        $this->timeline = htmlspecialchars(strip_tags($this->timeline));
        
        // Bind parameters
        $stmt->bindParam(":service_category_id", $this->service_category_id);
        $stmt->bindParam(":service_name", $this->service_name);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":remarks", $this->remarks);
        $stmt->bindParam(":timeline", $this->timeline);
        
        // Execute query
        if($stmt->execute()) {
            $this->service_id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Update service
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET 
                    service_category_id = :service_category_id,
                    service_name = :service_name, 
                    price = :price,
                    remarks = :remarks,
                    timeline = :timeline,
                    updated_at = NOW() 
                  WHERE 
                    service_id = :service_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->service_id = htmlspecialchars(strip_tags($this->service_id));
        $this->service_category_id = htmlspecialchars(strip_tags($this->service_category_id));
        $this->service_name = htmlspecialchars(strip_tags($this->service_name));
        $this->price = htmlspecialchars(strip_tags($this->price));
        $this->remarks = htmlspecialchars(strip_tags($this->remarks));
        $this->timeline = htmlspecialchars(strip_tags($this->timeline));
        
        // Bind parameters
        $stmt->bindParam(":service_id", $this->service_id);
        $stmt->bindParam(":service_category_id", $this->service_category_id);
        $stmt->bindParam(":service_name", $this->service_name);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":remarks", $this->remarks);
        $stmt->bindParam(":timeline", $this->timeline);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Delete service
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE service_id = :service_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->service_id = htmlspecialchars(strip_tags($this->service_id));
        $stmt->bindParam(":service_id", $this->service_id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Check if service name exists
    public function serviceNameExists() {
        $query = "SELECT service_id, service_name 
                  FROM " . $this->table_name . " 
                  WHERE service_name = :service_name";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->service_name = htmlspecialchars(strip_tags($this->service_name));
        $stmt->bindParam(":service_name", $this->service_name);
        
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
} 