<?php
class Project {
    // Database connection and table name
    private $conn;
    private $table_name = "projects";
    
    // Object properties
    public $project_id;
    public $project_name;
    public $client_id;
    public $proposal_id;
    public $attn_to;
    public $start_date;
    public $end_date;
    public $description;
    public $priority;
    public $status;
    public $total_amount;
    public $paid_amount;
    public $notes;
    public $created_by;
    public $created_at;
    public $updated_at;
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all projects
    public function getAll() {
        $query = "SELECT p.project_id, p.project_name, p.client_id, p.proposal_id, 
                         p.attn_to, p.start_date, p.end_date, p.description, p.priority,
                         p.status, p.total_amount, p.paid_amount, p.notes, p.created_by,
                         p.created_at, p.updated_at,
                         c.client_name, u.name as created_by_name,
                         pr.proposal_reference
                  FROM " . $this->table_name . " p
                  LEFT JOIN clients c ON p.client_id = c.client_id
                  LEFT JOIN users u ON p.created_by = u.id
                  LEFT JOIN proposals pr ON p.proposal_id = pr.proposal_id
                  ORDER BY p.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get projects by client ID
    public function getByClient($clientId) {
        $query = "SELECT p.project_id, p.project_name, p.client_id, p.proposal_id, 
                         p.attn_to, p.start_date, p.end_date, p.description, p.priority,
                         p.status, p.total_amount, p.paid_amount, p.notes, p.created_by,
                         p.created_at, p.updated_at,
                         c.client_name, u.name as created_by_name,
                         pr.proposal_reference
                  FROM " . $this->table_name . " p
                  LEFT JOIN clients c ON p.client_id = c.client_id
                  LEFT JOIN users u ON p.created_by = u.id
                  LEFT JOIN proposals pr ON p.proposal_id = pr.proposal_id
                  WHERE p.client_id = :client_id
                  ORDER BY p.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $clientId = htmlspecialchars(strip_tags($clientId));
        $stmt->bindParam(":client_id", $clientId);
        
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get projects by status
    public function getByStatus($status) {
        $query = "SELECT p.project_id, p.project_name, p.client_id, p.proposal_id, 
                         p.attn_to, p.start_date, p.end_date, p.description, p.priority,
                         p.status, p.total_amount, p.paid_amount, p.notes, p.created_by,
                         p.created_at, p.updated_at,
                         c.client_name, u.name as created_by_name,
                         pr.proposal_reference
                  FROM " . $this->table_name . " p
                  LEFT JOIN clients c ON p.client_id = c.client_id
                  LEFT JOIN users u ON p.created_by = u.id
                  LEFT JOIN proposals pr ON p.proposal_id = pr.proposal_id
                  WHERE p.status = :status
                  ORDER BY p.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $status = htmlspecialchars(strip_tags($status));
        $stmt->bindParam(":status", $status);
        
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get projects by proposal ID
    public function getByProposal($proposalId) {
        $query = "SELECT p.project_id, p.project_name, p.client_id, p.proposal_id, 
                         p.attn_to, p.start_date, p.end_date, p.description, p.priority,
                         p.status, p.total_amount, p.paid_amount, p.notes, p.created_by,
                         p.created_at, p.updated_at,
                         c.client_name, u.name as created_by_name,
                         pr.proposal_reference
                  FROM " . $this->table_name . " p
                  LEFT JOIN clients c ON p.client_id = c.client_id
                  LEFT JOIN users u ON p.created_by = u.id
                  LEFT JOIN proposals pr ON p.proposal_id = pr.proposal_id
                  WHERE p.proposal_id = :proposal_id
                  ORDER BY p.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $proposalId = htmlspecialchars(strip_tags($proposalId));
        $stmt->bindParam(":proposal_id", $proposalId);
        
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get single project by ID
    public function getById() {
        $query = "SELECT p.project_id, p.project_name, p.client_id, p.proposal_id, 
                         p.attn_to, p.start_date, p.end_date, p.description, p.priority,
                         p.status, p.total_amount, p.paid_amount, p.notes, p.created_by,
                         p.created_at, p.updated_at,
                         c.client_name, u.name as created_by_name,
                         pr.proposal_reference
                  FROM " . $this->table_name . " p
                  LEFT JOIN clients c ON p.client_id = c.client_id
                  LEFT JOIN users u ON p.created_by = u.id
                  LEFT JOIN proposals pr ON p.proposal_id = pr.proposal_id
                  WHERE p.project_id = :project_id 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->project_id = htmlspecialchars(strip_tags($this->project_id));
        $stmt->bindParam(":project_id", $this->project_id);
        
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            // Set properties
            $this->project_id = $row['project_id'];
            $this->project_name = $row['project_name'];
            $this->client_id = $row['client_id'];
            $this->proposal_id = $row['proposal_id'];
            $this->attn_to = $row['attn_to'];
            $this->start_date = $row['start_date'];
            $this->end_date = $row['end_date'];
            $this->description = $row['description'];
            $this->priority = $row['priority'];
            $this->status = $row['status'];
            $this->total_amount = $row['total_amount'];
            $this->paid_amount = $row['paid_amount'];
            $this->notes = $row['notes'];
            $this->created_by = $row['created_by'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            return true;
        }
        
        return false;
    }
    
    // Create project
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET 
                    project_name = :project_name,
                    client_id = :client_id,
                    proposal_id = :proposal_id,
                    attn_to = :attn_to,
                    start_date = :start_date,
                    end_date = :end_date,
                    description = :description,
                    priority = :priority,
                    status = :status,
                    total_amount = :total_amount,
                    paid_amount = :paid_amount,
                    notes = :notes,
                    created_by = :created_by,
                    created_at = NOW(), 
                    updated_at = NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->project_name = htmlspecialchars(strip_tags($this->project_name));
        $this->client_id = htmlspecialchars(strip_tags($this->client_id));
        $this->proposal_id = htmlspecialchars(strip_tags($this->proposal_id));
        $this->attn_to = htmlspecialchars(strip_tags($this->attn_to));
        $this->start_date = htmlspecialchars(strip_tags($this->start_date));
        $this->end_date = htmlspecialchars(strip_tags($this->end_date));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->priority = htmlspecialchars(strip_tags($this->priority));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->total_amount = htmlspecialchars(strip_tags($this->total_amount));
        $this->paid_amount = htmlspecialchars(strip_tags($this->paid_amount));
        $this->notes = htmlspecialchars(strip_tags($this->notes));
        $this->created_by = htmlspecialchars(strip_tags($this->created_by));
        
        // Bind parameters
        $stmt->bindParam(":project_name", $this->project_name);
        $stmt->bindParam(":client_id", $this->client_id);
        $stmt->bindParam(":proposal_id", $this->proposal_id);
        $stmt->bindParam(":attn_to", $this->attn_to);
        $stmt->bindParam(":start_date", $this->start_date);
        $stmt->bindParam(":end_date", $this->end_date);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":priority", $this->priority);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":total_amount", $this->total_amount);
        $stmt->bindParam(":paid_amount", $this->paid_amount);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":created_by", $this->created_by);
        
        // Execute query
        if($stmt->execute()) {
            $this->project_id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Update project
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET 
                    project_name = :project_name,
                    client_id = :client_id,
                    proposal_id = :proposal_id,
                    attn_to = :attn_to,
                    start_date = :start_date,
                    end_date = :end_date,
                    description = :description,
                    priority = :priority,
                    status = :status,
                    total_amount = :total_amount,
                    paid_amount = :paid_amount,
                    notes = :notes,
                    updated_at = NOW() 
                  WHERE 
                    project_id = :project_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->project_id = htmlspecialchars(strip_tags($this->project_id));
        $this->project_name = htmlspecialchars(strip_tags($this->project_name));
        $this->client_id = htmlspecialchars(strip_tags($this->client_id));
        $this->proposal_id = htmlspecialchars(strip_tags($this->proposal_id));
        $this->attn_to = htmlspecialchars(strip_tags($this->attn_to));
        $this->start_date = htmlspecialchars(strip_tags($this->start_date));
        $this->end_date = htmlspecialchars(strip_tags($this->end_date));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->priority = htmlspecialchars(strip_tags($this->priority));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->total_amount = htmlspecialchars(strip_tags($this->total_amount));
        $this->paid_amount = htmlspecialchars(strip_tags($this->paid_amount));
        $this->notes = htmlspecialchars(strip_tags($this->notes));
        
        // Bind parameters
        $stmt->bindParam(":project_id", $this->project_id);
        $stmt->bindParam(":project_name", $this->project_name);
        $stmt->bindParam(":client_id", $this->client_id);
        $stmt->bindParam(":proposal_id", $this->proposal_id);
        $stmt->bindParam(":attn_to", $this->attn_to);
        $stmt->bindParam(":start_date", $this->start_date);
        $stmt->bindParam(":end_date", $this->end_date);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":priority", $this->priority);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":total_amount", $this->total_amount);
        $stmt->bindParam(":paid_amount", $this->paid_amount);
        $stmt->bindParam(":notes", $this->notes);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Update project status
    public function updateStatus() {
        $query = "UPDATE " . $this->table_name . " 
                  SET 
                    status = :status,
                    updated_at = NOW() 
                  WHERE 
                    project_id = :project_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->project_id = htmlspecialchars(strip_tags($this->project_id));
        $this->status = htmlspecialchars(strip_tags($this->status));
        
        // Bind parameters
        $stmt->bindParam(":project_id", $this->project_id);
        $stmt->bindParam(":status", $this->status);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Update paid amount
    public function updatePaidAmount() {
        $query = "UPDATE " . $this->table_name . " 
                  SET 
                    paid_amount = :paid_amount,
                    updated_at = NOW() 
                  WHERE 
                    project_id = :project_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->project_id = htmlspecialchars(strip_tags($this->project_id));
        $this->paid_amount = htmlspecialchars(strip_tags($this->paid_amount));
        
        // Bind parameters
        $stmt->bindParam(":project_id", $this->project_id);
        $stmt->bindParam(":paid_amount", $this->paid_amount);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Delete project
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE project_id = :project_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->project_id = htmlspecialchars(strip_tags($this->project_id));
        $stmt->bindParam(":project_id", $this->project_id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Create project from proposal
    public function createFromProposal($proposalId, $userId) {
        // Get proposal details
        $query = "SELECT * FROM proposals WHERE proposal_id = :proposal_id LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":proposal_id", $proposalId);
        $stmt->execute();
        
        $proposal = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if(!$proposal) {
            return false;
        }
        
        // Set project properties from proposal
        $this->project_name = $proposal['project_name'];
        $this->client_id = $proposal['client_id'];
        $this->proposal_id = $proposal['proposal_id'];
        $this->attn_to = ''; // This will need to be set separately
        $this->start_date = $proposal['project_start'];
        $this->end_date = $proposal['project_end'];
        $this->description = '';
        $this->priority = 'Medium';
        $this->status = 'In Progress';
        $this->total_amount = $proposal['total_amount'];
        $this->paid_amount = $proposal['has_downpayment'] ? $proposal['downpayment_amount'] : 0;
        $this->notes = $proposal['notes'];
        $this->created_by = $userId;
        
        // Create the project
        return $this->create();
    }
} 