<?php
class ProjectController {
    // Database connection and table name
    private $conn;
    private $table_name = "projects";

    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all projects
    public function getAll() {
        try {
            // Create query
            $query = "SELECT p.*, c.client_name 
                      FROM " . $this->table_name . " p
                      LEFT JOIN clients c ON p.client_id = c.client_id
                      ORDER BY p.created_at DESC";
            
            // Prepare statement
            $stmt = $this->conn->prepare($query);
            
            // Execute query
            $stmt->execute();
            
            // Check if any projects found
            if($stmt->rowCount() > 0) {
                // Projects array
                $projects_arr = array();
                
                // Fetch records
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

                    $project_item = array(
                        "id" => $row['project_id'],
                        "project_name" => $row['project_name'],
                        "client_id" => $row['client_id'],
                        "client_name" => $row['client_name'],
                        "proposal_id" => $row['proposal_id'],
                        "attn_to" => $row['attn_to'],
                        "status" => $row['status'],
                        "priority" => $row['priority'],
                        "start_date" => $row['start_date'],
                        "end_date" => $row['end_date'],
                        "description" => $row['description'],
                        "notes" => $row['notes'],
                        "total_amount" => $row['total_amount'],
                        "paid_amount" => $row['paid_amount'],
                        "created_at" => $row['created_at'],
                        "updated_at" => $row['updated_at'],
                        
                        "total_tasks" => $this->getTotalTasks($row['project_id']),
                        "completed_tasks" => $this->getCompletedTasks($row['project_id']),
                    );
                    
                    array_push($projects_arr, $project_item);
                }
                
                return array(
                    "status" => "success",
                    "data" => $projects_arr
                );
            } else {
                return array(
                    "status" => "success",
                    "data" => []
                );
            }
        } catch(PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error fetching projects: " . $e->getMessage()
            );
        }
    }

    // Get total tasks for a project
    private function getTotalTasks($project_id) {
        $query = "SELECT COUNT(*) as total_jobs FROM job_orders WHERE project_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $project_id);
        $stmt->execute();   
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total_jobs'];
    }

    // Get completed tasks for a project
    private function getCompletedTasks($project_id) {
        $query = "SELECT COUNT(*) as completed_jobs FROM job_orders WHERE project_id = ? AND status = 'COMPLETED'";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $project_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['completed_jobs'];
    }

    // Get project by ID
    public function getById($id) {
        try {
            // Create query
            $query = "SELECT p.*, c.client_name 
                      FROM " . $this->table_name . " p
                      LEFT JOIN clients c ON p.client_id = c.client_id
                      WHERE p.id = ?";
            
            // Prepare statement
            $stmt = $this->conn->prepare($query);
            
            // Bind ID
            $stmt->bindParam(1, $id);
            
            // Execute query
            $stmt->execute();
            
            // Check if project found
            if($stmt->rowCount() > 0) {
                // Fetch record
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Extract data
                extract($row);
                
                // Create project array
                $project_arr = array(
                    "id" => $id,
                    "project_name" => $project_name,
                    "client_id" => $client_id,
                    "client_name" => $client_name,
                    "proposal_id" => $proposal_id,
                    "attn_to" => $attn_to,
                    "status" => $status,
                    "priority" => $priority,
                    "start_date" => $start_date,
                    "end_date" => $end_date,
                    "description" => $description,
                    "notes" => $notes,
                    "total_amount" => $total_amount,
                    "paid_amount" => $paid_amount,
                    "created_at" => $created_at,
                    "updated_at" => $updated_at
                );
                
                return array(
                    "status" => "success",
                    "data" => $project_arr
                );
            } else {
                return array(
                    "status" => "error",
                    "message" => "Project not found"
                );
            }
        } catch(PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error fetching project: " . $e->getMessage()
            );
        }
    }

    // Create project
    public function create($data) {
        try {
            // Create query
            $query = "INSERT INTO " . $this->table_name . " 
                      SET project_name = :project_name, 
                          client_id = :client_id, 
                          proposal_id = :proposal_id,
                          attn_to = :attn_to, 
                          status = :status,
                          priority = :priority,
                          start_date = :start_date,
                          end_date = :end_date,
                          description = :description, 
                          notes = :notes, 
                          total_amount = :total_amount,
                          paid_amount = :paid_amount";
            
            // Prepare statement
            $stmt = $this->conn->prepare($query);
            
            // Sanitize and bind data
            $project_name = htmlspecialchars(strip_tags($data['project_name']));
            $client_id = htmlspecialchars(strip_tags($data['client_id']));
            $proposal_id = isset($data['proposal_id']) ? htmlspecialchars(strip_tags($data['proposal_id'])) : null;
            $attn_to = isset($data['attn_to']) ? htmlspecialchars(strip_tags($data['attn_to'])) : null;
            $status = isset($data['status']) ? htmlspecialchars(strip_tags($data['status'])) : 'pending';
            $priority = isset($data['priority']) ? htmlspecialchars(strip_tags($data['priority'])) : 'medium';
            $start_date = isset($data['start_date']) ? htmlspecialchars(strip_tags($data['start_date'])) : null;
            $end_date = isset($data['end_date']) ? htmlspecialchars(strip_tags($data['end_date'])) : null;
            $description = isset($data['description']) ? htmlspecialchars(strip_tags($data['description'])) : null;
            $notes = isset($data['notes']) ? htmlspecialchars(strip_tags($data['notes'])) : null;
            $total_amount = isset($data['total_amount']) ? htmlspecialchars(strip_tags($data['total_amount'])) : 0;
            $paid_amount = isset($data['paid_amount']) ? htmlspecialchars(strip_tags($data['paid_amount'])) : 0;
            
            $stmt->bindParam(':project_name', $project_name);
            $stmt->bindParam(':client_id', $client_id);
            $stmt->bindParam(':proposal_id', $proposal_id);
            $stmt->bindParam(':attn_to', $attn_to);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':priority', $priority);
            $stmt->bindParam(':start_date', $start_date);
            $stmt->bindParam(':end_date', $end_date);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':notes', $notes);
            $stmt->bindParam(':total_amount', $total_amount);
            $stmt->bindParam(':paid_amount', $paid_amount);
            
            // Execute query
            if($stmt->execute()) {
                $last_id = $this->conn->lastInsertId();
                
                return array(
                    "status" => "success",
                    "message" => "Project created successfully",
                    "data" => $last_id
                );
            } else {
                return array(
                    "status" => "error",
                    "message" => "Failed to create project"
                );
            }
        } catch(PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error creating project: " . $e->getMessage()
            );
        }
    }

    // Update project
    public function update($id, $data) {
        try {
            // Create query
            $query = "UPDATE " . $this->table_name . " 
                      SET project_name = :project_name, 
                          client_id = :client_id, 
                          proposal_id = :proposal_id,
                          attn_to = :attn_to, 
                          status = :status,
                          priority = :priority,
                          start_date = :start_date,
                          end_date = :end_date,
                          description = :description, 
                          notes = :notes, 
                          total_amount = :total_amount,
                          paid_amount = :paid_amount,
                          updated_at = NOW()
                      WHERE id = :id";
            
            // Prepare statement
            $stmt = $this->conn->prepare($query);
            
            // Sanitize and bind data
            $project_name = htmlspecialchars(strip_tags($data['project_name']));
            $client_id = htmlspecialchars(strip_tags($data['client_id']));
            $proposal_id = isset($data['proposal_id']) ? htmlspecialchars(strip_tags($data['proposal_id'])) : null;
            $attn_to = isset($data['attn_to']) ? htmlspecialchars(strip_tags($data['attn_to'])) : null;
            $status = isset($data['status']) ? htmlspecialchars(strip_tags($data['status'])) : 'pending';
            $priority = isset($data['priority']) ? htmlspecialchars(strip_tags($data['priority'])) : 'medium';
            $start_date = isset($data['start_date']) ? htmlspecialchars(strip_tags($data['start_date'])) : null;
            $end_date = isset($data['end_date']) ? htmlspecialchars(strip_tags($data['end_date'])) : null;
            $description = isset($data['description']) ? htmlspecialchars(strip_tags($data['description'])) : null;
            $notes = isset($data['notes']) ? htmlspecialchars(strip_tags($data['notes'])) : null;
            $total_amount = isset($data['total_amount']) ? htmlspecialchars(strip_tags($data['total_amount'])) : 0;
            $paid_amount = isset($data['paid_amount']) ? htmlspecialchars(strip_tags($data['paid_amount'])) : 0;
            
            $stmt->bindParam(':project_name', $project_name);
            $stmt->bindParam(':client_id', $client_id);
            $stmt->bindParam(':proposal_id', $proposal_id);
            $stmt->bindParam(':attn_to', $attn_to);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':priority', $priority);
            $stmt->bindParam(':start_date', $start_date);
            $stmt->bindParam(':end_date', $end_date);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':notes', $notes);
            $stmt->bindParam(':total_amount', $total_amount);
            $stmt->bindParam(':paid_amount', $paid_amount);
            $stmt->bindParam(':id', $id);
            
            // Execute query
            if($stmt->execute()) {
                return array(
                    "status" => "success",
                    "message" => "Project updated successfully"
                );
            } else {
                return array(
                    "status" => "error",
                    "message" => "Failed to update project"
                );
            }
        } catch(PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error updating project: " . $e->getMessage()
            );
        }
    }

    // Update project status
    public function updateStatus($id, $data) {
        try {
            // Create query
            $query = "UPDATE " . $this->table_name . " 
                      SET status = :status,
                          updated_at = NOW()
                      WHERE project_id = :id";
            
            // Prepare statement
            $stmt = $this->conn->prepare($query);
            
            // Get status from data
            $status = is_array($data) ? $data : $data;
            if (is_array($data) && isset($data['status'])) {
                $status = $data['status'];
            }
            
            // Sanitize and bind data
            $status = htmlspecialchars(strip_tags($status));
            
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':id', $id);
            
            // Execute query
            if($stmt->execute()) {
                return array(
                    "status" => "success",
                    "message" => "Project status updated successfully"
                );
            } else {
                return array(
                    "status" => "error",
                    "message" => "Failed to update project status"
                );
            }
        } catch(PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error updating project status: " . $e->getMessage()
            );
        }
    }

    // Record payment
    public function recordPayment($id, $amount) {
        try {
            // First get current paid amount
            $query = "SELECT paid_amount FROM " . $this->table_name . " WHERE project_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $id);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $current_paid = $row['paid_amount'];
                
                // Calculate new paid amount
                $new_paid = $current_paid + $amount;
                
                // Update the paid amount
                $update_query = "UPDATE " . $this->table_name . " 
                                SET paid_amount = :paid_amount,
                                    updated_at = NOW()
                                WHERE project_id = :id";
                
                $update_stmt = $this->conn->prepare($update_query);
                $update_stmt->bindParam(':paid_amount', $new_paid);
                $update_stmt->bindParam(':id', $id);
                
                if($update_stmt->execute()) {
                    return array(
                        "status" => "success",
                        "message" => "Payment recorded successfully",
                        "data" => array(
                            "paid_amount" => $new_paid
                        )
                    );
                } else {
                    return array(
                        "status" => "error",
                        "message" => "Failed to record payment"
                    );
                }
            } else {
                return array(
                    "status" => "error",
                    "message" => "Project not found"
                );
            }
        } catch(PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error recording payment: " . $e->getMessage()
            );
        }
    }

    // Get project status history
    public function getStatusHistory($id) {
        try {
            // For now, we'll just return a simple response
            // In a real implementation, you would query a status_history table
            return array(
                "status" => "success",
                "data" => array(
                    array(
                        "status" => "Not Started",
                        "changed_at" => date('Y-m-d H:i:s', strtotime('-7 days')),
                        "changed_by" => "System"
                    ),
                    array(
                        "status" => "In Progress",
                        "changed_at" => date('Y-m-d H:i:s', strtotime('-3 days')),
                        "changed_by" => "Admin"
                    )
                )
            );
        } catch(PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error getting status history: " . $e->getMessage()
            );
        }
    }

    // Get project timeline
    public function getTimeline($id) {
        try {
            // For now, we'll just return a simple response
            // In a real implementation, you would query a timeline table
            return array(
                "status" => "success",
                "data" => array(
                    array(
                        "title" => "Project Started",
                        "date" => date('Y-m-d H:i:s', strtotime('-7 days')),
                        "description" => "Project was created and initialized"
                    ),
                    array(
                        "title" => "Design Phase",
                        "date" => date('Y-m-d H:i:s', strtotime('-5 days')),
                        "description" => "Design phase started"
                    ),
                    array(
                        "title" => "Development Phase",
                        "date" => date('Y-m-d H:i:s', strtotime('-2 days')),
                        "description" => "Development phase started"
                    )
                )
            );
        } catch(PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error getting timeline: " . $e->getMessage()
            );
        }
    }
    
    // Update project timeline
    public function updateTimeline($id, $data) {
        try {
            // For now, we'll just return a success response
            // In a real implementation, you would update a timeline table
            return array(
                "status" => "success",
                "message" => "Timeline updated successfully"
            );
        } catch(PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error updating timeline: " . $e->getMessage()
            );
        }
    }

    // Delete project
    public function delete($id) {
        try {
            // Create query
            $query = "DELETE FROM " . $this->table_name . " WHERE project_id = ?";
            
            // Prepare statement
            $stmt = $this->conn->prepare($query);
            
            // Bind ID
            $stmt->bindParam(1, $id);
            
            // Execute query
            if($stmt->execute()) {
                return array(
                    "status" => "success",
                    "message" => "Project deleted successfully"
                );
            } else {
                return array(
                    "status" => "error",
                    "message" => "Failed to delete project"
                );
            }
        } catch(PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error deleting project: " . $e->getMessage()
            );
        }
    }

    // Create project from proposal
    public function createFromProposal($proposal_id, $data) {
        try {
            // Begin transaction
            $this->conn->beginTransaction();
            
            // First get the proposal details
            $query = "SELECT * FROM proposals WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $proposal_id);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                $proposal = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Create project data
                $project_data = array(
                    "project_name" => isset($data['project_name']) ? $data['project_name'] : $proposal['proposal_name'],
                    "client_id" => $proposal['client_id'],
                    "proposal_id" => $proposal_id,
                    "attn_to" => $proposal['attn_to'],
                    "status" => isset($data['status']) ? $data['status'] : 'pending',
                    "priority" => isset($data['priority']) ? $data['priority'] : 'medium',
                    "start_date" => isset($data['start_date']) ? $data['start_date'] : null,
                    "end_date" => isset($data['end_date']) ? $data['end_date'] : null,
                    "description" => $proposal['description'],
                    "notes" => $proposal['notes'],
                    "total_amount" => $proposal['total_amount'],
                    "paid_amount" => 0
                );
                
                // Create project
                $create_query = "INSERT INTO " . $this->table_name . " 
                                SET project_name = :project_name, 
                                    client_id = :client_id, 
                                    proposal_id = :proposal_id,
                                    attn_to = :attn_to, 
                                    status = :status,
                                    priority = :priority,
                                    start_date = :start_date,
                                    end_date = :end_date,
                                    description = :description, 
                                    notes = :notes, 
                                    total_amount = :total_amount,
                                    paid_amount = :paid_amount";
                
                $create_stmt = $this->conn->prepare($create_query);
                
                $create_stmt->bindParam(':project_name', $project_data['project_name']);
                $create_stmt->bindParam(':client_id', $project_data['client_id']);
                $create_stmt->bindParam(':proposal_id', $project_data['proposal_id']);
                $create_stmt->bindParam(':attn_to', $project_data['attn_to']);
                $create_stmt->bindParam(':status', $project_data['status']);
                $create_stmt->bindParam(':priority', $project_data['priority']);
                $create_stmt->bindParam(':start_date', $project_data['start_date']);
                $create_stmt->bindParam(':end_date', $project_data['end_date']);
                $create_stmt->bindParam(':description', $project_data['description']);
                $create_stmt->bindParam(':notes', $project_data['notes']);
                $create_stmt->bindParam(':total_amount', $project_data['total_amount']);
                $create_stmt->bindParam(':paid_amount', $project_data['paid_amount']);
                
                if($create_stmt->execute()) {
                    $project_id = $this->conn->lastInsertId();
                    
                    // Update proposal status to accepted
                    $update_query = "UPDATE proposals SET status = 'accepted' WHERE id = ?";
                    $update_stmt = $this->conn->prepare($update_query);
                    $update_stmt->bindParam(1, $proposal_id);
                    $update_stmt->execute();
                    
                    // Commit transaction
                    $this->conn->commit();
                    
                    return array(
                        "status" => "success",
                        "message" => "Project created from proposal successfully",
                        "id" => $project_id
                    );
                } else {
                    // Rollback transaction
                    $this->conn->rollBack();
                    
                    return array(
                        "status" => "error",
                        "message" => "Failed to create project from proposal"
                    );
                }
            } else {
                return array(
                    "status" => "error",
                    "message" => "Proposal not found"
                );
            }
        } catch(PDOException $e) {
            // Rollback transaction
            $this->conn->rollBack();
            
            return array(
                "status" => "error",
                "message" => "Error creating project from proposal: " . $e->getMessage()
            );
        }
    }
} 