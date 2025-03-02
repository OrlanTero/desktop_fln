<?php
class Client {
    // Database connection and table name
    private $conn;
    private $table_name = "clients";
    
    // Object properties
    public $client_id;
    public $client_name;
    public $company;
    public $branch;
    public $address;
    public $address2;
    public $tax_type;
    public $account_for;
    public $rdo;
    public $email_address;
    public $description;
    public $client_type_id;
    public $status;
    public $created_at;
    public $updated_at;
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all clients
    public function getAll() {
        $query = "SELECT c.client_id, c.client_name, c.company, c.branch, c.address, c.address2, 
                         c.tax_type, c.account_for, c.rdo, c.email_address, c.description, 
                         c.client_type_id, c.status, c.created_at, c.updated_at,
                         t.name as client_type_name
                  FROM " . $this->table_name . " c
                  LEFT JOIN client_types t ON c.client_type_id = t.type_id
                  ORDER BY c.client_name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get single client by ID
    public function getById() {
        $query = "SELECT c.client_id, c.client_name, c.company, c.branch, c.address, c.address2, 
                         c.tax_type, c.account_for, c.rdo, c.email_address, c.description, 
                         c.client_type_id, c.status, c.created_at, c.updated_at,
                         t.name as client_type_name
                  FROM " . $this->table_name . " c
                  LEFT JOIN client_types t ON c.client_type_id = t.type_id
                  WHERE c.client_id = :client_id 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->client_id = htmlspecialchars(strip_tags($this->client_id));
        $stmt->bindParam(":client_id", $this->client_id);
        
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            // Set properties
            $this->client_id = $row['client_id'];
            $this->client_name = $row['client_name'];
            $this->company = $row['company'];
            $this->branch = $row['branch'];
            $this->address = $row['address'];
            $this->address2 = $row['address2'];
            $this->tax_type = $row['tax_type'];
            $this->account_for = $row['account_for'];
            $this->rdo = $row['rdo'];
            $this->email_address = $row['email_address'];
            $this->description = $row['description'];
            $this->client_type_id = $row['client_type_id'];
            $this->status = $row['status'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            return true;
        }
        
        return false;
    }
    
    // Create client
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET 
                    client_name = :client_name, 
                    company = :company,
                    branch = :branch,
                    address = :address,
                    address2 = :address2,
                    tax_type = :tax_type,
                    account_for = :account_for,
                    rdo = :rdo,
                    email_address = :email_address,
                    description = :description,
                    client_type_id = :client_type_id,
                    status = :status,
                    created_at = NOW(), 
                    updated_at = NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->client_name = htmlspecialchars(strip_tags($this->client_name));
        $this->company = htmlspecialchars(strip_tags($this->company));
        $this->branch = htmlspecialchars(strip_tags($this->branch));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->address2 = htmlspecialchars(strip_tags($this->address2));
        $this->tax_type = htmlspecialchars(strip_tags($this->tax_type));
        $this->account_for = htmlspecialchars(strip_tags($this->account_for));
        $this->rdo = htmlspecialchars(strip_tags($this->rdo));
        $this->email_address = htmlspecialchars(strip_tags($this->email_address));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->client_type_id = htmlspecialchars(strip_tags($this->client_type_id));
        $this->status = htmlspecialchars(strip_tags($this->status));
        
        // Bind parameters
        $stmt->bindParam(":client_name", $this->client_name);
        $stmt->bindParam(":company", $this->company);
        $stmt->bindParam(":branch", $this->branch);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":address2", $this->address2);
        $stmt->bindParam(":tax_type", $this->tax_type);
        $stmt->bindParam(":account_for", $this->account_for);
        $stmt->bindParam(":rdo", $this->rdo);
        $stmt->bindParam(":email_address", $this->email_address);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":client_type_id", $this->client_type_id);
        $stmt->bindParam(":status", $this->status);
        
        // Execute query
        if($stmt->execute()) {
            $this->client_id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Update client
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET 
                    client_name = :client_name, 
                    company = :company,
                    branch = :branch,
                    address = :address,
                    address2 = :address2,
                    tax_type = :tax_type,
                    account_for = :account_for,
                    rdo = :rdo,
                    email_address = :email_address,
                    description = :description,
                    client_type_id = :client_type_id,
                    status = :status,
                    updated_at = NOW() 
                  WHERE 
                    client_id = :client_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->client_id = htmlspecialchars(strip_tags($this->client_id));
        $this->client_name = htmlspecialchars(strip_tags($this->client_name));
        $this->company = htmlspecialchars(strip_tags($this->company));
        $this->branch = htmlspecialchars(strip_tags($this->branch));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->address2 = htmlspecialchars(strip_tags($this->address2));
        $this->tax_type = htmlspecialchars(strip_tags($this->tax_type));
        $this->account_for = htmlspecialchars(strip_tags($this->account_for));
        $this->rdo = htmlspecialchars(strip_tags($this->rdo));
        $this->email_address = htmlspecialchars(strip_tags($this->email_address));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->client_type_id = htmlspecialchars(strip_tags($this->client_type_id));
        $this->status = htmlspecialchars(strip_tags($this->status));
        
        // Bind parameters
        $stmt->bindParam(":client_id", $this->client_id);
        $stmt->bindParam(":client_name", $this->client_name);
        $stmt->bindParam(":company", $this->company);
        $stmt->bindParam(":branch", $this->branch);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":address2", $this->address2);
        $stmt->bindParam(":tax_type", $this->tax_type);
        $stmt->bindParam(":account_for", $this->account_for);
        $stmt->bindParam(":rdo", $this->rdo);
        $stmt->bindParam(":email_address", $this->email_address);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":client_type_id", $this->client_type_id);
        $stmt->bindParam(":status", $this->status);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Delete client
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE client_id = :client_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->client_id = htmlspecialchars(strip_tags($this->client_id));
        $stmt->bindParam(":client_id", $this->client_id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Check if client name exists
    public function clientNameExists() {
        $query = "SELECT client_id, client_name 
                  FROM " . $this->table_name . " 
                  WHERE client_name = :client_name";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->client_name = htmlspecialchars(strip_tags($this->client_name));
        $stmt->bindParam(":client_name", $this->client_name);
        
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }
} 