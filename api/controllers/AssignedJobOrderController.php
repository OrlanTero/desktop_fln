<?php
require_once 'models/AssignedJobOrder.php';
require_once 'controllers/JobOrderController.php';

class AssignedJobOrderController
{
    private $db;
    private $assignedJobOrder;

    public function __construct($db)
    {
        $this->db = $db;
        $this->assignedJobOrder = new AssignedJobOrder($db);
    }

    // Create new job order assignment
    public function create($data)
    {
        if (!isset($data['job_order_id']) || !isset($data['liaison_id'])) {
            return [
                'success' => false,
                'message' => 'Missing required fields'
            ];
        }

        try {
            // Start transaction
            $this->db->beginTransaction();

            // Set job order as assigned
            $updateQuery = "UPDATE job_orders SET is_assigned = 1 WHERE job_order_id = :job_order_id";
            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->bindParam(':job_order_id', $data['job_order_id']);
            $updateStmt->execute();

            // Create assignment
            $this->assignedJobOrder->job_order_id = $data['job_order_id'];
            $this->assignedJobOrder->liaison_id = $data['liaison_id'];
            $this->assignedJobOrder->status = isset($data['status']) ? $data['status'] : 'In Progress';
            $this->assignedJobOrder->notes = isset($data['notes']) ? $data['notes'] : '';

            if ($this->assignedJobOrder->create()) {
                // Commit transaction
                $this->db->commit();

                return [
                    'success' => true,
                    'message' => 'Job order assigned successfully'
                ];
            } else {
                // Rollback transaction
                $this->db->rollBack();

                return [
                    'success' => false,
                    'message' => 'Failed to assign job order'
                ];
            }
        } catch (Exception $e) {
            // Rollback transaction
            $this->db->rollBack();

            return [
                'success' => false,
                'message' => 'Error assigning job order: ' . $e->getMessage()
            ];
        }
    }

    // Get assigned job orders by project
    public function getAssignedByProject($project_id)
    {
        try {
            $stmt = $this->assignedJobOrder->getByProject($project_id);
            $assigned_orders = [];

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($assigned_orders, $row);
            }

            return [
                'success' => true,
                'data' => $assigned_orders
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error getting assigned job orders: ' . $e->getMessage()
            ];
        }
    }

    // Get assigned job orders by project and liaison
    public function getAssignedByProjectAndLiaison($project_id, $liaison_id)
    {
        try {
            $stmt = $this->assignedJobOrder->getByProjectAndLiaison($project_id, $liaison_id);
            $assigned_orders = [];

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($assigned_orders, $row);
            }

            return [
                'success' => true,
                'data' => $assigned_orders
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error getting assigned job orders: ' . $e->getMessage()
            ];
        }
    }
    // Get unassigned job orders by project
    public function getUnassignedByProject($project_id)
    {
        try {
            $stmt = $this->assignedJobOrder->getUnassignedByProject($project_id);
            $unassigned_orders = [];

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($unassigned_orders, $row);
            }

            return [
                'success' => true,
                'data' => $unassigned_orders
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error getting unassigned job orders: ' . $e->getMessage()
            ];
        }
    }

    // Update assigned job order status
    public function updateStatus($id, $data)
    {
        try {
            // Extract status from data
            $status = isset($data['status']) ? $data['status'] : null;

            if (!$status) {
                return [
                    'success' => false,
                    'message' => 'Status is required'
                ];
            }

            // Update assigned job order status using the new method
            $result = $this->assignedJobOrder->updateJobOrderStatus($id, $status);

            // Update job order status if requested
            if (isset($data['update_both_tables']) && $data['update_both_tables'] === true) {
                // Get the job order controller
                $jobOrderController = new JobOrderController($this->db);

                // Update the job order status
                $jobOrderController->updateStatus($id, $status);
            }

            if ($result) {
                return [
                    'success' => true,
                    'message' => 'Status updated successfully'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to update status'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error updating status: ' . $e->getMessage()
            ];
        }
    }

    // Delete assignment
    public function delete($id)
    {
        try {
            // Start transaction
            $this->db->beginTransaction();

            // Get the job_order_id for this assignment
            $query = "SELECT job_order_id FROM " . $this->assignedJobOrder->getTableName() . " WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $job_order_id = $row['job_order_id'];

                // Set job order as unassigned
                $updateQuery = "UPDATE job_orders SET is_assigned = 0 WHERE job_order_id = :job_order_id";
                $updateStmt = $this->db->prepare($updateQuery);
                $updateStmt->bindParam(':job_order_id', $job_order_id);
                $updateStmt->execute();
            }

            // Delete the assignment
            $this->assignedJobOrder->id = $id;

            if ($this->assignedJobOrder->delete()) {
                // Commit transaction
                $this->db->commit();

                return [
                    'success' => true,
                    'message' => 'Assignment deleted successfully'
                ];
            } else {
                // Rollback transaction
                $this->db->rollBack();

                return [
                    'success' => false,
                    'message' => 'Failed to delete assignment'
                ];
            }
        } catch (Exception $e) {
            // Rollback transaction
            $this->db->rollBack();

            return [
                'success' => false,
                'message' => 'Error deleting assignment: ' . $e->getMessage()
            ];
        }
    }
}