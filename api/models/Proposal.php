<?php
class Proposal {
    // Database connection and table name
    private $conn;
    private $table_name = "proposals";
    
    // Object properties
    public $proposal_id;
    public $proposal_name;
    public $client_id;
    public $proposal_reference;
    public $project_name;
    public $project_start;
    public $project_end;
    public $has_downpayment;
    public $downpayment_amount;
    public $total_amount;
    public $valid_until;
    public $notes;
    public $status;
    public $created_by;
    public $created_at;
    public $updated_at;
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all proposals
    public function getAll() {
        $query = "SELECT p.proposal_id, p.proposal_name, p.client_id, p.proposal_reference, 
                         p.project_name, p.project_start, p.project_end, p.has_downpayment,
                         p.downpayment_amount, p.total_amount, p.valid_until, p.notes, p.status,
                         p.created_by, p.created_at, p.updated_at,
                         c.client_name, u.name as created_by_name
                  FROM " . $this->table_name . " p
                  LEFT JOIN clients c ON p.client_id = c.client_id
                  LEFT JOIN users u ON p.created_by = u.id
                  ORDER BY p.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get proposals by client ID
    public function getByClient($clientId) {
        $query = "SELECT p.proposal_id, p.proposal_name, p.client_id, p.proposal_reference, 
                         p.project_name, p.project_start, p.project_end, p.has_downpayment,
                         p.downpayment_amount, p.total_amount, p.valid_until, p.notes, p.status,
                         p.created_by, p.created_at, p.updated_at,
                         c.client_name, u.name as created_by_name
                  FROM " . $this->table_name . " p
                  LEFT JOIN clients c ON p.client_id = c.client_id
                  LEFT JOIN users u ON p.created_by = u.id
                  WHERE p.client_id = :client_id
                  ORDER BY p.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $clientId = htmlspecialchars(strip_tags($clientId));
        $stmt->bindParam(":client_id", $clientId);
        
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get proposals by status
    public function getByStatus($status) {
        $query = "SELECT p.proposal_id, p.proposal_name, p.client_id, p.proposal_reference, 
                         p.project_name, p.project_start, p.project_end, p.has_downpayment,
                         p.downpayment_amount, p.total_amount, p.valid_until, p.notes, p.status,
                         p.created_by, p.created_at, p.updated_at,
                         c.client_name, u.name as created_by_name
                  FROM " . $this->table_name . " p
                  LEFT JOIN clients c ON p.client_id = c.client_id
                  LEFT JOIN users u ON p.created_by = u.id
                  WHERE p.status = :status
                  ORDER BY p.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $status = htmlspecialchars(strip_tags($status));
        $stmt->bindParam(":status", $status);
        
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get single proposal by ID
    public function getById() {
        $query = "SELECT p.proposal_id, p.proposal_name, p.client_id, p.proposal_reference, 
                         p.project_name, p.project_start, p.project_end, p.has_downpayment,
                         p.downpayment_amount, p.total_amount, p.valid_until, p.notes, p.status,
                         p.created_by, p.created_at, p.updated_at,
                         c.client_name, u.name as created_by_name
                  FROM " . $this->table_name . " p
                  LEFT JOIN clients c ON p.client_id = c.client_id
                  LEFT JOIN users u ON p.created_by = u.id
                  WHERE p.proposal_id = :proposal_id 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->proposal_id = htmlspecialchars(strip_tags($this->proposal_id));
        $stmt->bindParam(":proposal_id", $this->proposal_id);
        
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            // Set properties
            $this->proposal_id = $row['proposal_id'];
            $this->proposal_name = $row['proposal_name'];
            $this->client_id = $row['client_id'];
            $this->proposal_reference = $row['proposal_reference'];
            $this->project_name = $row['project_name'];
            $this->project_start = $row['project_start'];
            $this->project_end = $row['project_end'];
            $this->has_downpayment = $row['has_downpayment'];
            $this->downpayment_amount = $row['downpayment_amount'];
            $this->total_amount = $row['total_amount'];
            $this->valid_until = $row['valid_until'];
            $this->notes = $row['notes'];
            $this->status = $row['status'];
            $this->created_by = $row['created_by'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            return true;
        }
        
        return false;
    }
    
    // Create proposal
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET 
                    proposal_name = :proposal_name,
                    client_id = :client_id,
                    proposal_reference = :proposal_reference,
                    project_name = :project_name,
                    project_start = :project_start,
                    project_end = :project_end,
                    has_downpayment = :has_downpayment,
                    downpayment_amount = :downpayment_amount,
                    total_amount = :total_amount,
                    valid_until = :valid_until,
                    notes = :notes,
                    status = :status,
                    created_by = :created_by,
                    created_at = NOW(), 
                    updated_at = NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->proposal_name = htmlspecialchars(strip_tags($this->proposal_name));
        $this->client_id = htmlspecialchars(strip_tags($this->client_id));
        $this->proposal_reference = htmlspecialchars(strip_tags($this->proposal_reference));
        $this->project_name = htmlspecialchars(strip_tags($this->project_name));
        $this->project_start = htmlspecialchars(strip_tags($this->project_start));
        $this->project_end = htmlspecialchars(strip_tags($this->project_end));
        $this->has_downpayment = htmlspecialchars(strip_tags($this->has_downpayment));
        $this->downpayment_amount = htmlspecialchars(strip_tags($this->downpayment_amount));
        $this->total_amount = htmlspecialchars(strip_tags($this->total_amount));
        $this->valid_until = htmlspecialchars(strip_tags($this->valid_until));
        $this->notes = htmlspecialchars(strip_tags($this->notes));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->created_by = htmlspecialchars(strip_tags($this->created_by));
        
        // Bind parameters
        $stmt->bindParam(":proposal_name", $this->proposal_name);
        $stmt->bindParam(":client_id", $this->client_id);
        $stmt->bindParam(":proposal_reference", $this->proposal_reference);
        $stmt->bindParam(":project_name", $this->project_name);
        $stmt->bindParam(":project_start", $this->project_start);
        $stmt->bindParam(":project_end", $this->project_end);
        $stmt->bindParam(":has_downpayment", $this->has_downpayment);
        $stmt->bindParam(":downpayment_amount", $this->downpayment_amount);
        $stmt->bindParam(":total_amount", $this->total_amount);
        $stmt->bindParam(":valid_until", $this->valid_until);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":created_by", $this->created_by);
        
        // Execute query
        if($stmt->execute()) {
            $this->proposal_id = $this->conn->lastInsertId();
            return $this->conn->lastInsertId();
        }
        
        return false;
    }
    
    // Update proposal
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET 
                    proposal_name = :proposal_name,
                    client_id = :client_id,
                    proposal_reference = :proposal_reference,
                    project_name = :project_name,
                    project_start = :project_start,
                    project_end = :project_end,
                    has_downpayment = :has_downpayment,
                    downpayment_amount = :downpayment_amount,
                    total_amount = :total_amount,
                    valid_until = :valid_until,
                    notes = :notes,
                    status = :status,
                    updated_at = NOW() 
                  WHERE 
                    proposal_id = :proposal_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->proposal_id = htmlspecialchars(strip_tags($this->proposal_id));
        $this->proposal_name = htmlspecialchars(strip_tags($this->proposal_name));
        $this->client_id = htmlspecialchars(strip_tags($this->client_id));
        $this->proposal_reference = htmlspecialchars(strip_tags($this->proposal_reference));
        $this->project_name = htmlspecialchars(strip_tags($this->project_name));
        $this->project_start = htmlspecialchars(strip_tags($this->project_start));
        $this->project_end = htmlspecialchars(strip_tags($this->project_end));
        $this->has_downpayment = htmlspecialchars(strip_tags($this->has_downpayment));
        $this->downpayment_amount = htmlspecialchars(strip_tags($this->downpayment_amount));
        $this->total_amount = htmlspecialchars(strip_tags($this->total_amount));
        $this->valid_until = htmlspecialchars(strip_tags($this->valid_until));
        $this->notes = htmlspecialchars(strip_tags($this->notes));
        $this->status = htmlspecialchars(strip_tags($this->status));
        
        // Bind parameters
        $stmt->bindParam(":proposal_id", $this->proposal_id);
        $stmt->bindParam(":proposal_name", $this->proposal_name);
        $stmt->bindParam(":client_id", $this->client_id);
        $stmt->bindParam(":proposal_reference", $this->proposal_reference);
        $stmt->bindParam(":project_name", $this->project_name);
        $stmt->bindParam(":project_start", $this->project_start);
        $stmt->bindParam(":project_end", $this->project_end);
        $stmt->bindParam(":has_downpayment", $this->has_downpayment);
        $stmt->bindParam(":downpayment_amount", $this->downpayment_amount);
        $stmt->bindParam(":total_amount", $this->total_amount);
        $stmt->bindParam(":valid_until", $this->valid_until);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":status", $this->status);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Update proposal status
    public function updateStatus() {
        $query = "UPDATE " . $this->table_name . " 
                  SET 
                    status = :status,
                    updated_at = NOW() 
                  WHERE 
                    proposal_id = :proposal_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->proposal_id = htmlspecialchars(strip_tags($this->proposal_id));
        $this->status = htmlspecialchars(strip_tags($this->status));
        
        // Bind parameters
        $stmt->bindParam(":proposal_id", $this->proposal_id);
        $stmt->bindParam(":status", $this->status);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Delete proposal
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE proposal_id = :proposal_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->proposal_id = htmlspecialchars(strip_tags($this->proposal_id));
        $stmt->bindParam(":proposal_id", $this->proposal_id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Generate a unique proposal reference
    public function generateReference() {
        $prefix = "PROP-";
        $year = date('Y');
        $month = date('m');
        
        // Get the count of proposals for this month
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " 
                  WHERE YEAR(created_at) = :year AND MONTH(created_at) = :month";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":year", $year);
        $stmt->bindParam(":month", $month);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $count = $row['count'] + 1;
        
        // Format the count with leading zeros (e.g., 001, 002, etc.)
        $formattedCount = str_pad($count, 3, '0', STR_PAD_LEFT);
        
        // Generate the reference
        return $prefix . $year . $month . '-' . $formattedCount;
    }
} 