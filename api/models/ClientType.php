<?php
class ClientType {
    // Database connection and table name
    private $conn;
    private $table_name = "client_types";
    
    // Object properties
    public $type_id;
    public $name;
    public $description;
    public $created_at;
    public $updated_at;
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all client types
    public function getAll() {
        $query = "SELECT type_id, name, description, created_at, updated_at 
                  FROM " . $this->table_name . " 
                  ORDER BY name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get single client type by ID
    public function getById() {
        $query = "SELECT type_id, name, description, created_at, updated_at 
                  FROM " . $this->table_name . " 
                  WHERE type_id = :type_id 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->type_id = htmlspecialchars(strip_tags($this->type_id));
        $stmt->bindParam(":type_id", $this->type_id);
        
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            // Set properties
            $this->type_id = $row['type_id'];
            $this->name = $row['name'];
            $this->description = $row['description'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            return true;
        }
        
        return false;
    }
    
    // Create client type
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET 
                    name = :name, 
                    description = :description, 
                    created_at = NOW(), 
                    updated_at = NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->description = htmlspecialchars(strip_tags($this->description));
        
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);
        
        // Execute query
        if($stmt->execute()) {
            $this->type_id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Update client type
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET 
                    name = :name, 
                    description = :description, 
                    updated_at = NOW() 
                  WHERE 
                    type_id = :type_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->type_id = htmlspecialchars(strip_tags($this->type_id));
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->description = htmlspecialchars(strip_tags($this->description));
        
        $stmt->bindParam(":type_id", $this->type_id);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Delete client type
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE type_id = :type_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->type_id = htmlspecialchars(strip_tags($this->type_id));
        $stmt->bindParam(":type_id", $this->type_id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Check if name exists
    public function nameExists() {
        $query = "SELECT type_id, name, description 
                  FROM " . $this->table_name . " 
                  WHERE name = :name";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->name = htmlspecialchars(strip_tags($this->name));
        $stmt->bindParam(":name", $this->name);
        
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
} 