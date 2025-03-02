<?php
// Include the ServiceCategory model
require_once 'models/ServiceCategory.php';

class ServiceCategoryController {
    private $db;
    private $serviceCategory;
    
    public function __construct($db) {
        $this->db = $db;
        $this->serviceCategory = new ServiceCategory($db);
    }
    
    // Get all service categories
    public function getAll() {
        $stmt = $this->serviceCategory->getAll();
        $serviceCategories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            "status" => "success",
            "data" => $serviceCategories
        ];
    }
    
    // Get service category by ID
    public function getById($id) {
        $this->serviceCategory->service_category_id = $id;
        
        if($this->serviceCategory->getById()) {
            return [
                "status" => "success",
                "data" => [
                    "service_category_id" => $this->serviceCategory->service_category_id,
                    "service_category_name" => $this->serviceCategory->service_category_name,
                    "priority_number" => $this->serviceCategory->priority_number,
                    "added_by_id" => $this->serviceCategory->added_by_id,
                    "description" => $this->serviceCategory->description,
                    "created_at" => $this->serviceCategory->created_at,
                    "updated_at" => $this->serviceCategory->updated_at
                ]
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Service category not found"
            ];
        }
    }
    
    // Create service category
    public function create($data) {
        // Check if name already exists
        $this->serviceCategory->service_category_name = $data['service_category_name'];
        
        if($this->serviceCategory->categoryNameExists()) {
            return [
                "status" => "error",
                "message" => "A service category with this name already exists"
            ];
        }
        
        // Set service category properties
        $this->serviceCategory->service_category_name = $data['service_category_name'];
        $this->serviceCategory->priority_number = $data['priority_number'] ?? 0;
        $this->serviceCategory->added_by_id = $data['added_by_id'] ?? null;
        $this->serviceCategory->description = $data['description'] ?? '';
        
        // Create service category
        if($this->serviceCategory->create()) {
            return [
                "status" => "success",
                "message" => "Service category created successfully",
                "data" => [
                    "service_category_id" => $this->serviceCategory->service_category_id,
                    "service_category_name" => $this->serviceCategory->service_category_name,
                    "priority_number" => $this->serviceCategory->priority_number,
                    "description" => $this->serviceCategory->description
                ]
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to create service category"
            ];
        }
    }
    
    // Update service category
    public function update($id, $data) {
        // Set ID
        $this->serviceCategory->service_category_id = $id;
        
        // Check if service category exists
        if(!$this->serviceCategory->getById()) {
            return [
                "status" => "error",
                "message" => "Service category not found"
            ];
        }
        
        // Check if name is being changed and if it already exists
        if(isset($data['service_category_name']) && $data['service_category_name'] !== $this->serviceCategory->service_category_name) {
            $this->serviceCategory->service_category_name = $data['service_category_name'];
            
            if($this->serviceCategory->categoryNameExists()) {
                return [
                    "status" => "error",
                    "message" => "A service category with this name already exists"
                ];
            }
        }
        
        // Set service category properties
        $this->serviceCategory->service_category_name = $data['service_category_name'] ?? $this->serviceCategory->service_category_name;
        $this->serviceCategory->priority_number = $data['priority_number'] ?? $this->serviceCategory->priority_number;
        $this->serviceCategory->added_by_id = $data['added_by_id'] ?? $this->serviceCategory->added_by_id;
        $this->serviceCategory->description = $data['description'] ?? $this->serviceCategory->description;
        
        // Update service category
        if($this->serviceCategory->update()) {
            return [
                "status" => "success",
                "message" => "Service category updated successfully",
                "data" => [
                    "service_category_id" => $this->serviceCategory->service_category_id,
                    "service_category_name" => $this->serviceCategory->service_category_name,
                    "priority_number" => $this->serviceCategory->priority_number,
                    "description" => $this->serviceCategory->description
                ]
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to update service category"
            ];
        }
    }
    
    // Delete service category
    public function delete($id) {
        // Set ID
        $this->serviceCategory->service_category_id = $id;
        
        // Check if service category exists
        if(!$this->serviceCategory->getById()) {
            return [
                "status" => "error",
                "message" => "Service category not found"
            ];
        }
        
        // Delete service category
        if($this->serviceCategory->delete()) {
            return [
                "status" => "success",
                "message" => "Service category deleted successfully"
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to delete service category"
            ];
        }
    }
} 