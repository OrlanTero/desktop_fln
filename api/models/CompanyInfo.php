<?php
class CompanyInfo {
    // Database connection and table name
    private $conn;
    private $table_name = "company_info";
    
    // Object properties
    public $company_name;
    public $address;
    public $phone;
    public $email;
    public $updated_at;
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get company info
    public function get() {
        try {
            // Create query
            $query = "SELECT * FROM " . $this->table_name . " LIMIT 1";
            
            // Prepare statement
            $stmt = $this->conn->prepare($query);
            
            // Execute query
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Set properties
                $this->company_name = $row['company_name'];
                $this->address = $row['address'];
                $this->phone = $row['phone'];
                $this->email = $row['email'];
                $this->updated_at = $row['updated_at'];
                
                return true;
            }
            
            return false;
        } catch(PDOException $e) {
            throw new Exception("Error getting company info: " . $e->getMessage());
        }
    }
    
    // Update company info
    public function update() {
        try {
            // Create query
            $query = "UPDATE " . $this->table_name . " 
                     SET company_name = :company_name,
                         address = :address,
                         phone = :phone,
                         email = :email,
                         updated_at = NOW()";
            
            // Prepare statement
            $stmt = $this->conn->prepare($query);
            
            // Sanitize inputs
            $this->company_name = htmlspecialchars(strip_tags($this->company_name));
            $this->address = htmlspecialchars(strip_tags($this->address));
            $this->phone = htmlspecialchars(strip_tags($this->phone));
            $this->email = htmlspecialchars(strip_tags($this->email));
            
            // Bind parameters
            $stmt->bindParam(":company_name", $this->company_name);
            $stmt->bindParam(":address", $this->address);
            $stmt->bindParam(":phone", $this->phone);
            $stmt->bindParam(":email", $this->email);
            
            // Execute query
            if($stmt->execute()) {
                return true;
            }
            
            return false;
        } catch(PDOException $e) {
            throw new Exception("Error updating company info: " . $e->getMessage());
        }
    }
} 