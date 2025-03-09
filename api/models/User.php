<?php
class User {
    // Database connection and table name
    private $conn;
    private $table_name = "users";
    
    // Object properties
    public $id;
    public $name;
    public $email;
    public $password;
    public $role;
    public $photo_url;
    public $created_at;
    public $updated_at;
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all users
    public function getAll() {
        $query = "SELECT id, name, email, role, photo_url, created_at, updated_at 
                  FROM " . $this->table_name . " 
                  ORDER BY id DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }

    // Get all users by role
    public function getAllByRole($role) {
        $query = "SELECT id, name, email, role, photo_url, created_at, updated_at 
                  FROM " . $this->table_name . " 
                  WHERE role = :role 
                  ORDER BY id DESC";
                  
        $stmt = $this->conn->prepare($query);   
        $stmt->bindParam(":role", $role);
        $stmt->execute();
        
        return $stmt;
    }
    
    
    // Get single user by ID
    public function getById() {
        $query = "SELECT id, name, email, role, photo_url, created_at, updated_at 
                  FROM " . $this->table_name . " 
                  WHERE id = :id 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);
        
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->name = $row['name'];
            $this->email = $row['email'];
            $this->role = $row['role'];
            $this->photo_url = $row['photo_url'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        
        return false;
    }
    
    // Get user by email
    public function getByEmail() {
        $query = "SELECT id, name, email, password, role, photo_url, created_at, updated_at 
                  FROM " . $this->table_name . " 
                  WHERE email = :email 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->email = htmlspecialchars(strip_tags($this->email));
        $stmt->bindParam(":email", $this->email);
        
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->password = $row['password'];
            $this->role = $row['role'];
            $this->photo_url = $row['photo_url'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        
        return false;
    }
    
    // Create user
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (name, email, password, role, photo_url) 
                  VALUES 
                  (:name, :email, :password, :role, :photo_url)";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->password = htmlspecialchars(strip_tags($this->password));
        $this->role = htmlspecialchars(strip_tags($this->role));
        $this->photo_url = $this->photo_url ? htmlspecialchars(strip_tags($this->photo_url)) : null;
        
        // Hash the password
        $password_hash = password_hash($this->password, PASSWORD_BCRYPT);
        
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $password_hash);
        $stmt->bindParam(":role", $this->role);
        $stmt->bindParam(":photo_url", $this->photo_url);
        
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Update user
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET name = :name, 
                      email = :email, 
                      role = :role, 
                      photo_url = :photo_url 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->role = htmlspecialchars(strip_tags($this->role));
        $this->photo_url = $this->photo_url ? htmlspecialchars(strip_tags($this->photo_url)) : null;
        
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":role", $this->role);
        $stmt->bindParam(":photo_url", $this->photo_url);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Update password
    public function updatePassword() {
        $query = "UPDATE " . $this->table_name . " 
                  SET password = :password 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->password = htmlspecialchars(strip_tags($this->password));
        
        // Hash the password
        $password_hash = password_hash($this->password, PASSWORD_BCRYPT);
        
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":password", $password_hash);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Delete user
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Check if email exists
    public function emailExists() {
        $query = "SELECT id, name, email, password, role 
                  FROM " . $this->table_name . " 
                  WHERE email = :email 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->email = htmlspecialchars(strip_tags($this->email));
        $stmt->bindParam(":email", $this->email);
        
        $stmt->execute();
        
        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->password = $row['password'];
            $this->role = $row['role'];
            
            return true;
        }
        
        return false;
    }
    
    // Verify password
    public function verifyPassword($password) {
        return password_verify($password, $this->password);
    }
} 