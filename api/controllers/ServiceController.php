<?php
// Include the Service and ServiceRequirement models
require_once 'models/Service.php';
require_once 'models/ServiceRequirement.php';

class ServiceController {
    private $db;
    private $service;
    private $serviceRequirement;
    
    public function __construct($db) {
        $this->db = $db;
        $this->service = new Service($db);
        $this->serviceRequirement = new ServiceRequirement($db);
    }
    
    // Get all services
    public function getAll() {
        $stmt = $this->service->getAll();
        $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get requirements for each service
        foreach ($services as &$service) {
            $requirementsStmt = $this->serviceRequirement->getByServiceId($service['service_id']);
            $service['requirements'] = $requirementsStmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        return [
            "status" => "success",
            "data" => $services
        ];
    }
    
    // Get services by category ID
    public function getByCategory($categoryId) {
        $stmt = $this->service->getByCategory($categoryId);
        $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get requirements for each service
        foreach ($services as &$service) {
            $requirementsStmt = $this->serviceRequirement->getByServiceId($service['service_id']);
            $service['requirements'] = $requirementsStmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        return [
            "status" => "success",
            "data" => $services
        ];
    }
    
    // Get service by ID
    public function getById($id) {
        $this->service->service_id = $id;
        
        if($this->service->getById()) {
            $serviceData = [
                "service_id" => $this->service->service_id,
                "service_category_id" => $this->service->service_category_id,
                "service_name" => $this->service->service_name,
                "price" => $this->service->price,
                "remarks" => $this->service->remarks,
                "timeline" => $this->service->timeline,
                "created_at" => $this->service->created_at,
                "updated_at" => $this->service->updated_at
            ];
            
            // Get requirements for this service
            $requirementsStmt = $this->serviceRequirement->getByServiceId($id);
            $serviceData['requirements'] = $requirementsStmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                "status" => "success",
                "data" => $serviceData
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Service not found"
            ];
        }
    }
    
    // Create service
    public function create($data) {
        // Check if service name already exists
        $this->service->service_name = $data['service_name'];
        
        if($this->service->serviceNameExists()) {
            return [
                "status" => "error",
                "message" => "A service with this name already exists"
            ];
        }
        
        // Set service properties
        $this->service->service_category_id = $data['service_category_id'];
        $this->service->service_name = $data['service_name'];
        $this->service->price = $data['price'] ?? 0;
        $this->service->remarks = $data['remarks'] ?? '';
        $this->service->timeline = $data['timeline'] ?? '';
        
        // Start transaction
        $this->db->beginTransaction();
        
        try {
            // Create service
            if($this->service->create()) {
                $serviceId = $this->service->service_id;
                
                // Add requirements if provided
                if(isset($data['requirements']) && is_array($data['requirements'])) {
                    foreach($data['requirements'] as $req) {
                        $this->serviceRequirement->service_id = $serviceId;
                        $this->serviceRequirement->requirement = $req;
                        $this->serviceRequirement->create();
                    }
                }
                
                $this->db->commit();
                
                return [
                    "status" => "success",
                    "message" => "Service created successfully",
                    "data" => [
                        "service_id" => $serviceId,
                        "service_name" => $this->service->service_name,
                        "service_category_id" => $this->service->service_category_id
                    ]
                ];
            } else {
                $this->db->rollBack();
                return [
                    "status" => "error",
                    "message" => "Failed to create service"
                ];
            }
        } catch (Exception $e) {
            $this->db->rollBack();
            return [
                "status" => "error",
                "message" => "Error: " . $e->getMessage()
            ];
        }
    }
    
    // Update service
    public function update($id, $data) {
        // Set ID
        $this->service->service_id = $id;
        
        // Check if service exists
        if(!$this->service->getById()) {
            return [
                "status" => "error",
                "message" => "Service not found"
            ];
        }
        
        // Check if name is being changed and if it already exists
        if(isset($data['service_name']) && $data['service_name'] !== $this->service->service_name) {
            $this->service->service_name = $data['service_name'];
            
            if($this->service->serviceNameExists()) {
                return [
                    "status" => "error",
                    "message" => "A service with this name already exists"
                ];
            }
        }
        
        // Set service properties
        $this->service->service_category_id = $data['service_category_id'] ?? $this->service->service_category_id;
        $this->service->service_name = $data['service_name'] ?? $this->service->service_name;
        $this->service->price = $data['price'] ?? $this->service->price;
        $this->service->remarks = $data['remarks'] ?? $this->service->remarks;
        $this->service->timeline = $data['timeline'] ?? $this->service->timeline;
        
        // Start transaction
        $this->db->beginTransaction();
        
        try {
            // Update service
            if($this->service->update()) {
                // Update requirements if provided
                if(isset($data['requirements']) && is_array($data['requirements'])) {
                    // Delete existing requirements
                    $this->serviceRequirement->deleteByServiceId($id);
                    
                    // Add new requirements
                    foreach($data['requirements'] as $req) {
                        $this->serviceRequirement->service_id = $id;
                        $this->serviceRequirement->requirement = $req;
                        $this->serviceRequirement->create();
                    }
                }
                
                $this->db->commit();
                
                return [
                    "status" => "success",
                    "message" => "Service updated successfully",
                    "data" => [
                        "service_id" => $this->service->service_id,
                        "service_name" => $this->service->service_name,
                        "service_category_id" => $this->service->service_category_id
                    ]
                ];
            } else {
                $this->db->rollBack();
                return [
                    "status" => "error",
                    "message" => "Failed to update service"
                ];
            }
        } catch (Exception $e) {
            $this->db->rollBack();
            return [
                "status" => "error",
                "message" => "Error: " . $e->getMessage()
            ];
        }
    }
    
    // Delete service
    public function delete($id) {
        // Set ID
        $this->service->service_id = $id;
        
        // Check if service exists
        if(!$this->service->getById()) {
            return [
                "status" => "error",
                "message" => "Service not found"
            ];
        }
        
        // Start transaction
        $this->db->beginTransaction();
        
        try {
            // Delete requirements first
            $this->serviceRequirement->deleteByServiceId($id);
            
            // Delete service
            if($this->service->delete()) {
                $this->db->commit();
                return [
                    "status" => "success",
                    "message" => "Service deleted successfully"
                ];
            } else {
                $this->db->rollBack();
                return [
                    "status" => "error",
                    "message" => "Failed to delete service"
                ];
            }
        } catch (Exception $e) {
            $this->db->rollBack();
            return [
                "status" => "error",
                "message" => "Error: " . $e->getMessage()
            ];
        }
    }
    
    // Get requirements for a service
    public function getRequirements($serviceId) {
        $stmt = $this->serviceRequirement->getByServiceId($serviceId);
        $requirements = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            "status" => "success",
            "data" => $requirements
        ];
    }
    
    // Add requirement to a service
    public function addRequirement($serviceId, $data) {
        // Check if service exists
        $this->service->service_id = $serviceId;
        if(!$this->service->getById()) {
            return [
                "status" => "error",
                "message" => "Service not found"
            ];
        }
        
        // Set requirement properties
        $this->serviceRequirement->service_id = $serviceId;
        $this->serviceRequirement->requirement = $data['requirement'];
        
        // Create requirement
        if($this->serviceRequirement->create()) {
            return [
                "status" => "success",
                "message" => "Requirement added successfully",
                "data" => [
                    "requirement_id" => $this->serviceRequirement->requirement_id,
                    "service_id" => $this->serviceRequirement->service_id,
                    "requirement" => $this->serviceRequirement->requirement
                ]
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to add requirement"
            ];
        }
    }
    
    // Update requirement
    public function updateRequirement($requirementId, $data) {
        // Set ID
        $this->serviceRequirement->requirement_id = $requirementId;
        
        // Check if requirement exists
        if(!$this->serviceRequirement->getById()) {
            return [
                "status" => "error",
                "message" => "Requirement not found"
            ];
        }
        
        // Set requirement properties
        $this->serviceRequirement->requirement = $data['requirement'] ?? $this->serviceRequirement->requirement;
        
        // Update requirement
        if($this->serviceRequirement->update()) {
            return [
                "status" => "success",
                "message" => "Requirement updated successfully",
                "data" => [
                    "requirement_id" => $this->serviceRequirement->requirement_id,
                    "service_id" => $this->serviceRequirement->service_id,
                    "requirement" => $this->serviceRequirement->requirement
                ]
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to update requirement"
            ];
        }
    }
    
    // Delete requirement
    public function deleteRequirement($requirementId) {
        // Set ID
        $this->serviceRequirement->requirement_id = $requirementId;
        
        // Check if requirement exists
        if(!$this->serviceRequirement->getById()) {
            return [
                "status" => "error",
                "message" => "Requirement not found"
            ];
        }
        
        // Delete requirement
        if($this->serviceRequirement->delete()) {
            return [
                "status" => "success",
                "message" => "Requirement deleted successfully"
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to delete requirement"
            ];
        }
    }
} 