<?php
class ProService {
    // Database connection and table name
    private $conn;
    private $table_name = "pro_services";
    
    // Object properties
    public $pro_service_id;
    public $proposal_id;

    public $project_id;
    public $service_id;
    public $pro_type;
    public $quantity;
    public $price;
    public $unit_price;
    public $discount_percentage;
    public $created_at;
    public $updated_at;
    
    // Constructor with database connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Get all pro services by proposal ID
    public function getByProposal($proposalId) {
        $query = "SELECT ps.pro_service_id, ps.proposal_id, ps.service_id, ps.pro_type, 
                         ps.quantity, ps.price, ps.unit_price, ps.discount_percentage,
                         ps.created_at, ps.updated_at,
                         s.service_name, s.service_category_id, sc.service_category_name
                  FROM " . $this->table_name . " ps
                  LEFT JOIN services s ON ps.service_id = s.service_id
                  LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id
                  WHERE ps.proposal_id = :proposal_id AND ps.pro_type = 'Proposal'
                  ORDER BY sc.priority_number ASC, s.service_name ASC";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $proposalId = htmlspecialchars(strip_tags($proposalId));
        $stmt->bindParam(":proposal_id", $proposalId);
        
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get all pro services by project ID
    public function getByProject($projectId) {
        $query = "SELECT ps.pro_service_id, ps.proposal_id, ps.service_id, ps.pro_type, 
                         ps.quantity, ps.price, ps.unit_price, ps.discount_percentage,
                         ps.created_at, ps.updated_at,
                         s.service_name, s.service_category_id, sc.service_category_name
                  FROM " . $this->table_name . " ps
                  LEFT JOIN services s ON ps.service_id = s.service_id
                  LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id
                  LEFT JOIN projects p ON ps.proposal_id = p.proposal_id
                  WHERE p.project_id = :project_id AND ps.pro_type = 'Project'
                  ORDER BY sc.priority_number ASC, s.service_name ASC";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $projectId = htmlspecialchars(strip_tags($projectId));
        $stmt->bindParam(":project_id", $projectId);
        
        $stmt->execute();
        
        return $stmt;
    }
    
    // Get single pro service by ID
    public function getById() {
        $query = "SELECT ps.pro_service_id, ps.proposal_id, ps.service_id, ps.pro_type, 
                         ps.quantity, ps.price, ps.unit_price, ps.discount_percentage,
                         ps.created_at, ps.updated_at,
                         s.service_name, s.service_category_id, sc.service_category_name
                  FROM " . $this->table_name . " ps
                  LEFT JOIN services s ON ps.service_id = s.service_id
                  LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id
                  WHERE ps.pro_service_id = :pro_service_id 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->pro_service_id = htmlspecialchars(strip_tags($this->pro_service_id));
        $stmt->bindParam(":pro_service_id", $this->pro_service_id);
        
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            // Set properties
            $this->pro_service_id = $row['pro_service_id'];
            $this->proposal_id = $row['proposal_id'];
            $this->service_id = $row['service_id'];
            $this->pro_type = $row['pro_type'];
            $this->quantity = $row['quantity'];
            $this->price = $row['price'];
            $this->unit_price = $row['unit_price'];
            $this->discount_percentage = $row['discount_percentage'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            return true;
        }
        
        return false;
    }
    
    // Create pro service
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET 
                    proposal_id = :proposal_id,
                    project_id = :project_id,
                    service_id = :service_id,
                    pro_type = :pro_type,
                    quantity = :quantity,
                    price = :price,
                    unit_price = :unit_price,
                    discount_percentage = :discount_percentage,
                    created_at = NOW(), 
                    updated_at = NOW()";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->project_id = htmlspecialchars(strip_tags($this->project_id));
        $this->proposal_id = htmlspecialchars(strip_tags($this->proposal_id));
        $this->service_id = htmlspecialchars(strip_tags($this->service_id));
        $this->pro_type = htmlspecialchars(strip_tags($this->pro_type));
        $this->quantity = htmlspecialchars(strip_tags($this->quantity));
        $this->price = htmlspecialchars(strip_tags($this->price));
        $this->unit_price = htmlspecialchars(strip_tags($this->unit_price));
        $this->discount_percentage = htmlspecialchars(strip_tags($this->discount_percentage));
        
        // Bind parameters
        $stmt->bindParam(":proposal_id", $this->proposal_id);
        $stmt->bindParam(":project_id", $this->project_id);
        $stmt->bindParam(":service_id", $this->service_id);
        $stmt->bindParam(":pro_type", $this->pro_type);
        $stmt->bindParam(":quantity", $this->quantity);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":unit_price", $this->unit_price);
        $stmt->bindParam(":discount_percentage", $this->discount_percentage);
        
        // Execute query
        if($stmt->execute()) {
            $this->pro_service_id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    // Update pro service
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET 
                    proposal_id = :proposal_id,
                    service_id = :service_id,
                    pro_type = :pro_type,
                    quantity = :quantity,
                    price = :price,
                    unit_price = :unit_price,
                    discount_percentage = :discount_percentage,
                    updated_at = NOW() 
                  WHERE 
                    pro_service_id = :pro_service_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize inputs
        $this->pro_service_id = htmlspecialchars(strip_tags($this->pro_service_id));
        $this->proposal_id = htmlspecialchars(strip_tags($this->proposal_id));
        $this->service_id = htmlspecialchars(strip_tags($this->service_id));
        $this->pro_type = htmlspecialchars(strip_tags($this->pro_type));
        $this->quantity = htmlspecialchars(strip_tags($this->quantity));
        $this->price = htmlspecialchars(strip_tags($this->price));
        $this->unit_price = htmlspecialchars(strip_tags($this->unit_price));
        $this->discount_percentage = htmlspecialchars(strip_tags($this->discount_percentage));
        
        // Bind parameters
        $stmt->bindParam(":pro_service_id", $this->pro_service_id);
        $stmt->bindParam(":proposal_id", $this->proposal_id);
        $stmt->bindParam(":service_id", $this->service_id);
        $stmt->bindParam(":pro_type", $this->pro_type);
        $stmt->bindParam(":quantity", $this->quantity);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":unit_price", $this->unit_price);
        $stmt->bindParam(":discount_percentage", $this->discount_percentage);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Delete pro service
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE pro_service_id = :pro_service_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $this->pro_service_id = htmlspecialchars(strip_tags($this->pro_service_id));
        $stmt->bindParam(":pro_service_id", $this->pro_service_id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Delete all pro services for a proposal
    public function deleteByProposal($proposalId) {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE proposal_id = :proposal_id AND pro_type = 'Proposal'";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $proposalId = htmlspecialchars(strip_tags($proposalId));
        $stmt->bindParam(":proposal_id", $proposalId);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Delete all pro services for a project
    public function deleteByProject($proposalId) {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE proposal_id = :proposal_id AND pro_type = 'Project'";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $proposalId = htmlspecialchars(strip_tags($proposalId));
        $stmt->bindParam(":proposal_id", $proposalId);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    // Calculate total amount for a proposal
    public function calculateProposalTotal($proposalId) {
        $query = "SELECT SUM(price) as total FROM " . $this->table_name . " 
                  WHERE proposal_id = :proposal_id AND pro_type = 'Proposal'";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize and bind
        $proposalId = htmlspecialchars(strip_tags($proposalId));
        $stmt->bindParam(":proposal_id", $proposalId);
        
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['total'] ? $row['total'] : 0;
    }
    
    // Copy services from proposal to project
    public function copyToProject($proposalId) {
        // Get all services for the proposal
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE proposal_id = :proposal_id AND pro_type = 'Proposal'";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":proposal_id", $proposalId);
        $stmt->execute();
        
        $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if(empty($services)) {
            return false;
        }
        
        // Start transaction
        $this->conn->beginTransaction();
        
        try {
            foreach($services as $service) {
                $query = "INSERT INTO " . $this->table_name . " 
                          SET 
                            proposal_id = :proposal_id,
                            service_id = :service_id,
                            pro_type = 'Project',
                            quantity = :quantity,
                            price = :price,
                            unit_price = :unit_price,
                            discount_percentage = :discount_percentage,
                            created_at = NOW(), 
                            updated_at = NOW()";
                
                $stmt = $this->conn->prepare($query);
                
                $stmt->bindParam(":proposal_id", $service['proposal_id']);
                $stmt->bindParam(":service_id", $service['service_id']);
                $stmt->bindParam(":quantity", $service['quantity']);
                $stmt->bindParam(":price", $service['price']);
                $stmt->bindParam(":unit_price", $service['unit_price']);
                $stmt->bindParam(":discount_percentage", $service['discount_percentage']);
                
                $stmt->execute();
            }
            
            $this->conn->commit();
            return true;
        } catch(Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }
} 