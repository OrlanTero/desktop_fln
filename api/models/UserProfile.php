<?php
class UserProfile {
    // Database connection and table name
    private $conn;
    private $table_name = "user_profiles";
    
    // Object properties
    public $id;
    public $user_id;
    public $phone;
    public $address;
    public $bio;
    public $position;
    public $department;
    public $skills;
    public $social_links;
    public $preferences;
    public $created_at;
    public $updated_at;
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get profile by user ID
    public function getByUserId() {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE user_id = :user_id 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $stmt->bindParam(":user_id", $this->user_id);
        
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->phone = $row['phone'];
            $this->address = $row['address'];
            $this->bio = $row['bio'];
            $this->position = $row['position'];
            $this->department = $row['department'];
            $this->skills = $row['skills'];
            $this->social_links = $row['social_links'];
            $this->preferences = $row['preferences'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        
        return false;
    }
    
    // Create profile
    public function create() {
        try {
            $query = "INSERT INTO " . $this->table_name . " 
                      (user_id, phone, address, bio, position, department, skills, social_links, preferences) 
                      VALUES 
                      (:user_id, :phone, :address, :bio, :position, :department, :skills, :social_links, :preferences)";
            
            $stmt = $this->conn->prepare($query);
            
            // Sanitize and bind
            $this->user_id = htmlspecialchars(strip_tags($this->user_id));
            $this->phone = $this->phone ? htmlspecialchars(strip_tags($this->phone)) : null;
            $this->address = $this->address ? htmlspecialchars(strip_tags($this->address)) : null;
            $this->bio = $this->bio ? htmlspecialchars(strip_tags($this->bio)) : null;
            $this->position = $this->position ? htmlspecialchars(strip_tags($this->position)) : null;
            $this->department = $this->department ? htmlspecialchars(strip_tags($this->department)) : null;
            $this->skills = $this->skills ? htmlspecialchars(strip_tags($this->skills)) : null;
            $this->social_links = $this->social_links ? htmlspecialchars(strip_tags($this->social_links)) : null;
            $this->preferences = $this->preferences ? htmlspecialchars(strip_tags($this->preferences)) : null;
            
            $stmt->bindParam(":user_id", $this->user_id);
            $stmt->bindParam(":phone", $this->phone);
            $stmt->bindParam(":address", $this->address);
            $stmt->bindParam(":bio", $this->bio);
            $stmt->bindParam(":position", $this->position);
            $stmt->bindParam(":department", $this->department);
            $stmt->bindParam(":skills", $this->skills);
            $stmt->bindParam(":social_links", $this->social_links);
            $stmt->bindParam(":preferences", $this->preferences);
            
            if($stmt->execute()) {
                $this->id = $this->conn->lastInsertId();
                return true;
            }
            
            return false;
        } catch (PDOException $e) {
            // Log the error
            error_log("UserProfile create error: " . $e->getMessage());
            return false;
        }
    }
    
    // Update profile
    public function update() {
        try {
            $query = "UPDATE " . $this->table_name . " 
                      SET phone = :phone, 
                          address = :address, 
                          bio = :bio, 
                          position = :position, 
                          department = :department, 
                          skills = :skills, 
                          social_links = :social_links, 
                          preferences = :preferences 
                      WHERE user_id = :user_id";
            
            $stmt = $this->conn->prepare($query);
            
            // Sanitize and bind
            $this->user_id = htmlspecialchars(strip_tags($this->user_id));
            $this->phone = $this->phone ? htmlspecialchars(strip_tags($this->phone)) : null;
            $this->address = $this->address ? htmlspecialchars(strip_tags($this->address)) : null;
            $this->bio = $this->bio ? htmlspecialchars(strip_tags($this->bio)) : null;
            $this->position = $this->position ? htmlspecialchars(strip_tags($this->position)) : null;
            $this->department = $this->department ? htmlspecialchars(strip_tags($this->department)) : null;
            $this->skills = $this->skills ? htmlspecialchars(strip_tags($this->skills)) : null;
            $this->social_links = $this->social_links ? htmlspecialchars(strip_tags($this->social_links)) : null;
            $this->preferences = $this->preferences ? htmlspecialchars(strip_tags($this->preferences)) : null;
            
            $stmt->bindParam(":user_id", $this->user_id);
            $stmt->bindParam(":phone", $this->phone);
            $stmt->bindParam(":address", $this->address);
            $stmt->bindParam(":bio", $this->bio);
            $stmt->bindParam(":position", $this->position);
            $stmt->bindParam(":department", $this->department);
            $stmt->bindParam(":skills", $this->skills);
            $stmt->bindParam(":social_links", $this->social_links);
            $stmt->bindParam(":preferences", $this->preferences);
            
            if($stmt->execute()) {
                return true;
            }
            
            return false;
        } catch (PDOException $e) {
            // Log the error
            error_log("UserProfile update error: " . $e->getMessage());
            return false;
        }
    }
    
    // Create or update profile
    public function createOrUpdate() {
        try {
            // Check if profile exists
            $query = "SELECT id FROM " . $this->table_name . " WHERE user_id = :user_id LIMIT 0,1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $this->user_id);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                // Update existing profile
                return $this->update();
            } else {
                // Create new profile
                return $this->create();
            }
        } catch (PDOException $e) {
            // Log the error
            error_log("UserProfile createOrUpdate error: " . $e->getMessage());
            return false;
        }
    }
    
    // Delete profile
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $stmt->bindParam(":user_id", $this->user_id);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
} 