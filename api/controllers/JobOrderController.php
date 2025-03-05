<?php

require_once 'models/JobOrder.php';

class JobOrderController {
    private $db;
    private $jobOrder;

    public function __construct($db) {
        $this->db = $db;
        $this->jobOrder = new JobOrder($db);
    }

    public function create($request) {
        // Get posted data
        $data = json_decode($request->body(), true);
        
    
        if (!$data) {
            return [
                'success' => false,
                'message' => 'Invalid JSON data',
               
            ];
        }

        // Validate required fields
        if (empty($data['service_id']) || 
            empty($data['description']) || !isset($data['estimated_fee'])) {
            return [
                'success' => false,
                'message' => 'Missing required fields'
            ];
        }

        // Set job order properties
        $this->jobOrder->service_id = $data['service_id'];
        $this->jobOrder->proposal_id = $data['proposal_id'];
        $this->jobOrder->project_id = $data['project_id'];
        $this->jobOrder->description = $data['description'];
        $this->jobOrder->estimated_fee = $data['estimated_fee'];
        $this->jobOrder->status = $data['status'] ?? 'Pending';
        
        // Create job order
        if ($this->jobOrder->create()) {
            return [
                'success' => true,
                'message' => 'Job order created successfully',
                'data' => [
                    'job_order_id' => $this->db->lastInsertId()
                ]
            ];
        }

        return [
            'success' => false,
            'message' => 'Failed to create job order'
        ];
    }

    public function getByService($serviceId, $proposalId) {
        $result = $this->jobOrder->getByService($serviceId, $proposalId);
        $jobOrders = $result->fetchAll(PDO::FETCH_ASSOC);

        if ($jobOrders) {
            return [
                'success' => true,
                'data' => $jobOrders
            ];
        }

        return [
            'success' => false,
            'message' => 'No job orders found'
        ];
    }

    public function update($id, $request) {
        $data = json_decode($request->body(), true);

        if (!$data) {
            return [
                'success' => false,
                'message' => 'Invalid JSON data'
            ];
        }

        // Set job order properties
        $this->jobOrder->job_order_id = $id;
        $this->jobOrder->description = $data['description'] ?? null;
        $this->jobOrder->estimated_fee = $data['estimated_fee'] ?? null;
        $this->jobOrder->status = $data['status'] ?? null;

        if ($this->jobOrder->update()) {
            return [
                'success' => true,
                'message' => 'Job order updated successfully'
            ];
        }

        return [
            'success' => false,
            'message' => 'Failed to update job order'
        ];
    }

    public function delete($id) {
        $this->jobOrder->job_order_id = $id;

        if ($this->jobOrder->delete()) {
            return [
                'success' => true,
                'message' => 'Job order deleted successfully'
            ];
        }

        return [
            'success' => false,
            'message' => 'Failed to delete job order'
        ];
    }
} 