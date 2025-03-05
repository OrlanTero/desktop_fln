<?php
require_once 'models/ProService.php';
require_once 'models/Service.php';

class ProServiceController {
    private $db;
    private $proService;
    private $service;
    
    public function __construct($db) {
        $this->db = $db;
        $this->proService = new ProService($db);
        $this->service = new Service($db);
    }
    
    // Get all pro services by proposal ID
    public function getByProposal($proposalId) {
        // Validate proposal ID
        if(empty($proposalId)) {
            return [
                'success' => false,
                'message' => 'Proposal ID is required'
            ];
        }
        
        // Get pro services
        $stmt = $this->proService->getByProposal($proposalId);
        $num = $stmt->rowCount();
        
        if($num > 0) {
            $proServices = [];
            
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $proService = [
                    'pro_service_id' => $row['pro_service_id'],
                    'proposal_id' => $row['proposal_id'],
                    'service_id' => $row['service_id'],
                    'pro_type' => $row['pro_type'],
                    'quantity' => $row['quantity'],
                    'price' => $row['price'],
                    'unit_price' => $row['unit_price'],
                    'discount_percentage' => $row['discount_percentage'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at'],
                    'service_name' => $row['service_name'],
                    'service_category_id' => $row['service_category_id'],
                    'service_category_name' => $row['service_category_name']
                ];
                
                $proServices[] = $proService;
            }
            
            return [
                'success' => true,
                'data' => $proServices
            ];
        } else {
            return [
                'success' => true,
                'data' => []
            ];
        }
    }
    
    // Get all pro services by project ID
    public function getByProject($projectId) {
        // Validate project ID
        if(empty($projectId)) {
            return [
                'success' => false,
                'message' => 'Project ID is required'
            ];
        }
        
        // Get pro services
        $stmt = $this->proService->getByProject($projectId);
        $num = $stmt->rowCount();
        
        if($num > 0) {
            $proServices = [];
            
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $proService = [
                    'pro_service_id' => $row['pro_service_id'],
                    'proposal_id' => $row['proposal_id'],
                    'service_id' => $row['service_id'],
                    'pro_type' => $row['pro_type'],
                    'quantity' => $row['quantity'],
                    'price' => $row['price'],
                    'unit_price' => $row['unit_price'],
                    'discount_percentage' => $row['discount_percentage'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at'],
                    'service_name' => $row['service_name'],
                    'service_category_id' => $row['service_category_id'],
                    'service_category_name' => $row['service_category_name']
                ];
                
                $proServices[] = $proService;
            }
            
            return [
                'success' => true,
                'data' => $proServices
            ];
        } else {
            return [
                'success' => true,
                'data' => []
            ];
        }
    }
    
    // Get pro service by ID
    public function getById($id) {
        // Validate ID
        if(empty($id)) {
            return [
                'success' => false,
                'message' => 'Pro Service ID is required'
            ];
        }
        
        // Set ID property
        $this->proService->pro_service_id = $id;
        
        // Get pro service
        if($this->proService->getById()) {
            $proService = [
                'pro_service_id' => $this->proService->pro_service_id,
                'proposal_id' => $this->proService->proposal_id,
                'service_id' => $this->proService->service_id,
                'pro_type' => $this->proService->pro_type,
                'quantity' => $this->proService->quantity,
                'price' => $this->proService->price,
                'unit_price' => $this->proService->unit_price,
                'discount_percentage' => $this->proService->discount_percentage,
                'created_at' => $this->proService->created_at,
                'updated_at' => $this->proService->updated_at
            ];
            
            return [
                'success' => true,
                'data' => $proService
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Pro Service not found'
            ];
        }
    }
    
    // Create pro service
    public function create($data) {
        // Validate data
        if(empty($data->proposal_id) || empty($data->service_id) || empty($data->pro_type)) {
            error_log("Missing required fields: " . json_encode([
                'proposal_id' => $data->proposal_id ?? null,
                'service_id' => $data->service_id ?? null,
                'pro_type' => $data->pro_type ?? null
            ]));
            return [
                'success' => false,
                'message' => 'Proposal ID, Service ID, and Pro Type are required'
            ];
        }
        
        // Check if service exists
        $this->service->service_id = $data->service_id;
        if(!$this->service->getById()) {
            error_log("Service not found: " . $data->service_id);
            return [
                'success' => false,
                'message' => 'Service not found'
            ];
        }
        
        try {
            // Set pro service properties
            $this->proService->proposal_id = $data->proposal_id;
            $this->proService->service_id = $data->service_id;
            $this->proService->pro_type = $data->pro_type;
            $this->proService->quantity = $data->quantity ?? 1;
            $this->proService->unit_price = $data->unit_price ?? 0;
            $this->proService->discount_percentage = $data->discount_percentage ?? 0;
            
            // Calculate price
            $this->proService->price = $this->proService->unit_price * $this->proService->quantity;
            
            // Apply discount if any
            if($this->proService->discount_percentage > 0) {
                $discount = ($this->proService->price * $this->proService->discount_percentage) / 100;
                $this->proService->price = $this->proService->price - $discount;
            }
            
            error_log("Attempting to create pro service with data: " . json_encode([
                'proposal_id' => $this->proService->proposal_id,
                'service_id' => $this->proService->service_id,
                'pro_type' => $this->proService->pro_type,
                'quantity' => $this->proService->quantity,
                'unit_price' => $this->proService->unit_price,
                'price' => $this->proService->price,
                'discount_percentage' => $this->proService->discount_percentage
            ]));
            
            // Create pro service
            if($this->proService->create()) {
                return [
                    'success' => true,
                    'message' => 'Pro Service created successfully',
                    'data' => [
                        'pro_service_id' => $this->proService->pro_service_id,
                        'proposal_id' => $this->proService->proposal_id,
                        'service_id' => $this->proService->service_id,
                        'pro_type' => $this->proService->pro_type,
                        'quantity' => $this->proService->quantity,
                        'price' => $this->proService->price,
                        'unit_price' => $this->proService->unit_price,
                        'discount_percentage' => $this->proService->discount_percentage
                    ]
                ];
            } else {
                error_log("Failed to create pro service in database");
                return [
                    'success' => false,
                    'message' => 'Failed to create Pro Service'
                ];
            }
        } catch (Exception $e) {
            error_log("Exception creating pro service: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error creating pro service: ' . $e->getMessage()
            ];
        }
    }
    
    // Update pro service
    public function update($id, $data) {
        // Validate ID
        if(empty($id)) {
            return [
                'success' => false,
                'message' => 'Pro Service ID is required'
            ];
        }
        
        // Set ID property
        $this->proService->pro_service_id = $id;
        
        // Check if pro service exists
        if(!$this->proService->getById()) {
            return [
                'success' => false,
                'message' => 'Pro Service not found'
            ];
        }
        
        // Check if service exists if service_id is provided
        if(!empty($data->service_id)) {
            $this->service->service_id = $data->service_id;
            if(!$this->service->getById()) {
                return [
                    'success' => false,
                    'message' => 'Service not found'
                ];
            }
        }
        
        // Set pro service properties
        $this->proService->proposal_id = $data->proposal_id ?? $this->proService->proposal_id;
        $this->proService->service_id = $data->service_id ?? $this->proService->service_id;
        $this->proService->pro_type = $data->pro_type ?? $this->proService->pro_type;
        $this->proService->quantity = $data->quantity ?? $this->proService->quantity;
        $this->proService->unit_price = $data->unit_price ?? $this->proService->unit_price;
        $this->proService->discount_percentage = $data->discount_percentage ?? $this->proService->discount_percentage;
        
        // Calculate price
        $this->proService->price = $this->proService->unit_price * $this->proService->quantity;
        
        // Apply discount if any
        if($this->proService->discount_percentage > 0) {
            $discount = ($this->proService->price * $this->proService->discount_percentage) / 100;
            $this->proService->price = $this->proService->price - $discount;
        }
        
        // Update pro service
        if($this->proService->update()) {
            return [
                'success' => true,
                'message' => 'Pro Service updated successfully',
                'data' => [
                    'pro_service_id' => $this->proService->pro_service_id,
                    'proposal_id' => $this->proService->proposal_id,
                    'service_id' => $this->proService->service_id,
                    'pro_type' => $this->proService->pro_type,
                    'quantity' => $this->proService->quantity,
                    'price' => $this->proService->price,
                    'unit_price' => $this->proService->unit_price,
                    'discount_percentage' => $this->proService->discount_percentage
                ]
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Failed to update Pro Service'
            ];
        }
    }
    
    // Delete pro service
    public function delete($id) {
        // Validate ID
        if(empty($id)) {
            return [
                'success' => false,
                'message' => 'Pro Service ID is required'
            ];
        }
        
        // Set ID property
        $this->proService->pro_service_id = $id;
        
        // Check if pro service exists
        if(!$this->proService->getById()) {
            return [
                'success' => false,
                'message' => 'Pro Service not found'
            ];
        }
        
        // Delete pro service
        if($this->proService->delete()) {
            return [
                'success' => true,
                'message' => 'Pro Service deleted successfully'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Failed to delete Pro Service'
            ];
        }
    }
    
    // Delete all pro services for a proposal
    public function deleteByProposal($proposalId) {
        // Validate proposal ID
        if(empty($proposalId)) {
            return [
                'success' => false,
                'message' => 'Proposal ID is required'
            ];
        }
        
        // Delete pro services
        if($this->proService->deleteByProposal($proposalId)) {
            return [
                'success' => true,
                'message' => 'Pro Services deleted successfully'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Failed to delete Pro Services'
            ];
        }
    }
    
    // Delete all pro services for a project
    public function deleteByProject($proposalId) {
        // Validate proposal ID
        if(empty($proposalId)) {
            return [
                'success' => false,
                'message' => 'Proposal ID is required'
            ];
        }
        
        // Delete pro services
        if($this->proService->deleteByProject($proposalId)) {
            return [
                'success' => true,
                'message' => 'Pro Services deleted successfully'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Failed to delete Pro Services'
            ];
        }
    }
    
    // Calculate total amount for a proposal
    public function calculateProposalTotal($proposalId) {
        // Validate proposal ID
        if(empty($proposalId)) {
            return [
                'success' => false,
                'message' => 'Proposal ID is required'
            ];
        }
        
        // Calculate total
        $total = $this->proService->calculateProposalTotal($proposalId);
        
        return [
            'success' => true,
            'data' => [
                'total' => $total
            ]
        ];
    }
    
    // Copy services from proposal to project
    public function copyToProject($proposalId) {
        // Validate proposal ID
        if(empty($proposalId)) {
            return [
                'success' => false,
                'message' => 'Proposal ID is required'
            ];
        }
        
        // Copy services
        if($this->proService->copyToProject($proposalId)) {
            return [
                'success' => true,
                'message' => 'Services copied to project successfully'
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Failed to copy services to project'
            ];
        }
    }
} 