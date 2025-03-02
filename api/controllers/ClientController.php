<?php
// Include the Client model
require_once 'models/Client.php';

class ClientController {
    private $db;
    private $client;
    
    public function __construct($db) {
        $this->db = $db;
        $this->client = new Client($db);
    }
    
    // Get all clients
    public function getAll() {
        $stmt = $this->client->getAll();
        $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            "status" => "success",
            "data" => $clients
        ];
    }
    
    // Get client by ID
    public function getById($id) {
        $this->client->client_id = $id;
        
        if($this->client->getById()) {
            return [
                "status" => "success",
                "data" => [
                    "client_id" => $this->client->client_id,
                    "client_name" => $this->client->client_name,
                    "company" => $this->client->company,
                    "branch" => $this->client->branch,
                    "address" => $this->client->address,
                    "address2" => $this->client->address2,
                    "tax_type" => $this->client->tax_type,
                    "account_for" => $this->client->account_for,
                    "rdo" => $this->client->rdo,
                    "email_address" => $this->client->email_address,
                    "description" => $this->client->description,
                    "client_type_id" => $this->client->client_type_id,
                    "status" => $this->client->status,
                    "created_at" => $this->client->created_at,
                    "updated_at" => $this->client->updated_at
                ]
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Client not found"
            ];
        }
    }
    
    // Create client
    public function create($data) {
        // Check if client name already exists
        $this->client->client_name = $data['client_name'];
        
        if($this->client->clientNameExists()) {
            return [
                "status" => "error",
                "message" => "A client with this name already exists"
            ];
        }
        
        // Set client properties
        $this->client->client_name = $data['client_name'];
        $this->client->company = $data['company'] ?? '';
        $this->client->branch = $data['branch'] ?? '';
        $this->client->address = $data['address'] ?? '';
        $this->client->address2 = $data['address2'] ?? '';
        $this->client->tax_type = $data['tax_type'] ?? '';
        $this->client->account_for = $data['account_for'] ?? '';
        $this->client->rdo = $data['rdo'] ?? '';
        $this->client->email_address = $data['email_address'] ?? '';
        $this->client->description = $data['description'] ?? '';
        $this->client->client_type_id = $data['client_type_id'] ?? null;
        $this->client->status = $data['status'] ?? 'active';
        
        // Create client
        if($this->client->create()) {
            return [
                "status" => "success",
                "message" => "Client created successfully",
                "data" => [
                    "client_id" => $this->client->client_id,
                    "client_name" => $this->client->client_name,
                    "company" => $this->client->company,
                    "status" => $this->client->status
                ]
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to create client"
            ];
        }
    }
    
    // Update client
    public function update($id, $data) {
        // Set ID
        $this->client->client_id = $id;
        
        // Check if client exists
        if(!$this->client->getById()) {
            return [
                "status" => "error",
                "message" => "Client not found"
            ];
        }
        
        // Check if client name is being changed and if it already exists
        if(isset($data['client_name']) && $data['client_name'] !== $this->client->client_name) {
            $this->client->client_name = $data['client_name'];
            
            if($this->client->clientNameExists()) {
                return [
                    "status" => "error",
                    "message" => "A client with this name already exists"
                ];
            }
        }
        
        // Set client properties
        $this->client->client_name = $data['client_name'] ?? $this->client->client_name;
        $this->client->company = $data['company'] ?? $this->client->company;
        $this->client->branch = $data['branch'] ?? $this->client->branch;
        $this->client->address = $data['address'] ?? $this->client->address;
        $this->client->address2 = $data['address2'] ?? $this->client->address2;
        $this->client->tax_type = $data['tax_type'] ?? $this->client->tax_type;
        $this->client->account_for = $data['account_for'] ?? $this->client->account_for;
        $this->client->rdo = $data['rdo'] ?? $this->client->rdo;
        $this->client->email_address = $data['email_address'] ?? $this->client->email_address;
        $this->client->description = $data['description'] ?? $this->client->description;
        $this->client->client_type_id = $data['client_type_id'] ?? $this->client->client_type_id;
        $this->client->status = $data['status'] ?? $this->client->status;
        
        // Update client
        if($this->client->update()) {
            return [
                "status" => "success",
                "message" => "Client updated successfully",
                "data" => [
                    "client_id" => $this->client->client_id,
                    "client_name" => $this->client->client_name,
                    "company" => $this->client->company,
                    "status" => $this->client->status
                ]
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to update client"
            ];
        }
    }
    
    // Delete client
    public function delete($id) {
        // Set ID
        $this->client->client_id = $id;
        
        // Check if client exists
        if(!$this->client->getById()) {
            return [
                "status" => "error",
                "message" => "Client not found"
            ];
        }
        
        // Delete client
        if($this->client->delete()) {
            return [
                "status" => "success",
                "message" => "Client deleted successfully"
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to delete client"
            ];
        }
    }
} 