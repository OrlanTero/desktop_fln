<?php
// Include the ClientType model
require_once 'models/ClientType.php';

class ClientTypeController {
    private $db;
    private $clientType;
    
    public function __construct($db) {
        $this->db = $db;
        $this->clientType = new ClientType($db);
    }
    
    // Get all client types
    public function getAll() {
        $stmt = $this->clientType->getAll();
        $clientTypes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            "status" => "success",
            "data" => $clientTypes
        ];
    }
    
    // Get client type by ID
    public function getById($id) {
        $this->clientType->type_id = $id;
        
        if($this->clientType->getById()) {
            return [
                "status" => "success",
                "data" => [
                    "type_id" => $this->clientType->type_id,
                    "name" => $this->clientType->name,
                    "description" => $this->clientType->description,
                    "created_at" => $this->clientType->created_at,
                    "updated_at" => $this->clientType->updated_at
                ]
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Client type not found"
            ];
        }
    }
    
    // Create client type
    public function create($data) {
        // Check if name already exists
        $this->clientType->name = $data['name'];
        
        if($this->clientType->nameExists()) {
            return [
                "status" => "error",
                "message" => "A client type with this name already exists"
            ];
        }
        
        // Set client type properties
        $this->clientType->name = $data['name'];
        $this->clientType->description = $data['description'] ?? '';
        
        // Create client type
        if($this->clientType->create()) {
            return [
                "status" => "success",
                "message" => "Client type created successfully",
                "data" => [
                    "type_id" => $this->clientType->type_id,
                    "name" => $this->clientType->name,
                    "description" => $this->clientType->description
                ]
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to create client type"
            ];
        }
    }
    
    // Update client type
    public function update($id, $data) {
        // Set ID
        $this->clientType->type_id = $id;
        
        // Check if client type exists
        if(!$this->clientType->getById()) {
            return [
                "status" => "error",
                "message" => "Client type not found"
            ];
        }
        
        // Check if name is being changed and if it already exists
        if(isset($data['name']) && $data['name'] !== $this->clientType->name) {
            $this->clientType->name = $data['name'];
            
            if($this->clientType->nameExists()) {
                return [
                    "status" => "error",
                    "message" => "A client type with this name already exists"
                ];
            }
        }
        
        // Set client type properties
        $this->clientType->name = $data['name'] ?? $this->clientType->name;
        $this->clientType->description = $data['description'] ?? $this->clientType->description;
        
        // Update client type
        if($this->clientType->update()) {
            return [
                "status" => "success",
                "message" => "Client type updated successfully",
                "data" => [
                    "type_id" => $this->clientType->type_id,
                    "name" => $this->clientType->name,
                    "description" => $this->clientType->description
                ]
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to update client type"
            ];
        }
    }
    
    // Delete client type
    public function delete($id) {
        // Set ID
        $this->clientType->type_id = $id;
        
        // Check if client type exists
        if(!$this->clientType->getById()) {
            return [
                "status" => "error",
                "message" => "Client type not found"
            ];
        }
        
        // Delete client type
        if($this->clientType->delete()) {
            return [
                "status" => "success",
                "message" => "Client type deleted successfully"
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to delete client type"
            ];
        }
    }
} 