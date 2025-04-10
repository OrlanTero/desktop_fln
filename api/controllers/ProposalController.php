<?php
class ProposalController
{
    // Database connection and table name
    private $conn;
    private $table_name = "proposals";

    // Constructor with DB connection
    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Get all proposals
    public function getAll()
    {
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

            // Check if any proposals found
            if ($stmt->rowCount() > 0) {
                // Proposals array
                $proposals_arr = array();

                // Fetch records
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    // extract($row);

                    $proposal_item = array(
                        "id" => $row['proposal_id'],
                        "proposal_reference" => $row['proposal_reference'],
                        "proposal_name" => $row['proposal_name'],
                        "client_id" => $row['client_id'],
                        "client_name" => $row['client_name'],
                        "attn_to" => $row['attn_to'],
                        "status" => $row['status'],
                        "project_name" => $row['project_name'],
                        "project_start" => $row['project_start'],
                        "project_end" => $row['project_end'],
                        "description" => $row['description'],
                        "notes" => $row['notes'],
                        "total_amount" => $row['total_amount'],
                        "created_at" => $row['created_at'],
                        "updated_at" => $row['updated_at']
                    );

                    array_push($proposals_arr, $proposal_item);
                }

                return array(
                    "status" => "success",
                    "data" => $proposals_arr
                );
            } else {
                return array(
                    "status" => "success",
                    "data" => []
                );
            }
        } catch (PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error fetching proposals: " . $e->getMessage()
            );
        }
    }

    // Get proposal by ID
    public function getById($id)
    {
        try {
            // Create query
            $query = "SELECT p.*, c.client_name 
                      FROM " . $this->table_name . " p
                      LEFT JOIN clients c ON p.client_id = c.client_id
                      WHERE p.proposal_id = ?";

            // Prepare statement
            $stmt = $this->conn->prepare($query);

            // Bind ID
            $stmt->bindParam(1, $id);

            // Execute query
            $stmt->execute();

            // Check if proposal found
            if ($stmt->rowCount() > 0) {
                // Fetch record
                $row = $stmt->fetch(PDO::FETCH_ASSOC);

                // Extract data
                extract($row);

                // Create proposal array
                $proposal_arr = array(
                    "id" => $id,
                    "proposal_reference" => $proposal_reference,
                    "proposal_name" => $proposal_name,
                    "client_id" => $client_id,
                    "client_name" => $client_name,
                    "attn_to" => $attn_to,
                    "status" => $status,
                    "description" => $description,
                    "notes" => $notes,
                    "total_amount" => $total_amount,
                    "created_at" => $created_at,
                    "updated_at" => $updated_at
                );

                return array(
                    "status" => "success",
                    "data" => $proposal_arr
                );
            } else {
                return array(
                    "status" => "error",
                    "message" => "Proposal not found"
                );
            }
        } catch (PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error fetching proposal: " . $e->getMessage()
            );
        }
    }

    // Create proposal
    public function create($data)
    {
        try {
            // Generate proposal reference
            $year = date('Y');
            $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " 
                      WHERE YEAR(created_at) = :year";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":year", $year);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $count = $row['count'] + 1;
            $proposal_reference = 'PRO-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            // Create query
            $query = "INSERT INTO " . $this->table_name . " 
                      SET proposal_name = :proposal_name, 
                          proposal_reference = :proposal_reference,
                          client_id = :client_id, 
                          attn_to = :attn_to, 
                          status = :status, 
                          project_name = :project_name,
                          project_start = :project_start,
                          project_end = :project_end,
                          valid_until = :valid_until,
                          has_downpayment = :has_downpayment,
                          downpayment_amount = :downpayment_amount,
                          description = :description, 
                          notes = :notes, 
                          total_amount = :total_amount,
                          created_at = NOW(),
                          updated_at = NOW()";

            // Prepare statement
            $stmt = $this->conn->prepare($query);

            // Sanitize and bind data
            $proposal_name = htmlspecialchars(strip_tags($data['proposal_name']));
            $client_id = htmlspecialchars(strip_tags($data['client_id']));
            $attn_to = isset($data['attn_to']) ? htmlspecialchars(strip_tags($data['attn_to'])) : null;
            $status = isset($data['status']) ? htmlspecialchars(strip_tags($data['status'])) : 'Draft';
            $project_name = isset($data['project_name']) ? htmlspecialchars(strip_tags($data['project_name'])) : null;
            $project_start = isset($data['project_start']) ? htmlspecialchars(strip_tags($data['project_start'])) : null;
            $project_end = isset($data['project_end']) ? htmlspecialchars(strip_tags($data['project_end'])) : null;
            $valid_until = isset($data['valid_until']) ? htmlspecialchars(strip_tags($data['valid_until'])) : null;
            $has_downpayment = isset($data['has_downpayment']) ? (int) $data['has_downpayment'] : 0;
            $downpayment_amount = isset($data['downpayment_amount']) ? (float) $data['downpayment_amount'] : 0;
            $description = isset($data['description']) ? htmlspecialchars(strip_tags($data['description'])) : null;
            $notes = isset($data['notes']) ? htmlspecialchars(strip_tags($data['notes'])) : null;
            $total_amount = isset($data['total_amount']) ? (float) $data['total_amount'] : 0;

            $stmt->bindParam(':proposal_name', $proposal_name);
            $stmt->bindParam(':proposal_reference', $proposal_reference);
            $stmt->bindParam(':client_id', $client_id);
            $stmt->bindParam(':attn_to', $attn_to);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':project_name', $project_name);
            $stmt->bindParam(':project_start', $project_start);
            $stmt->bindParam(':project_end', $project_end);
            $stmt->bindParam(':valid_until', $valid_until);
            $stmt->bindParam(':has_downpayment', $has_downpayment);
            $stmt->bindParam(':downpayment_amount', $downpayment_amount);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':notes', $notes);
            $stmt->bindParam(':total_amount', $total_amount);

            // Execute query
            if ($stmt->execute()) {
                $last_id = $this->conn->lastInsertId();

                return array(
                    "status" => "success",
                    "message" => "Proposal created successfully",
                    "data" => array(
                        "proposal_id" => $last_id
                    )
                );
            } else {
                return array(
                    "status" => "error",
                    "message" => "Failed to create proposal"
                );
            }
        } catch (PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error creating proposal: " . $e->getMessage()
            );
        }
    }

    // Update proposal
    public function update($id, $data)
    {
        try {
            // Create query
            $query = "UPDATE " . $this->table_name . " 
                      SET proposal_name = :proposal_name, 
                          client_id = :client_id, 
                          attn_to = :attn_to, 
                          status = :status, 
                          description = :description, 
                          notes = :notes, 
                          total_amount = :total_amount,
                          updated_at = NOW()
                      WHERE proposal_id = :id";

            // Prepare statement
            $stmt = $this->conn->prepare($query);

            // Sanitize and bind data
            $proposal_name = htmlspecialchars(strip_tags($data['proposal_name']));
            $client_id = htmlspecialchars(strip_tags($data['client_id']));
            $attn_to = isset($data['attn_to']) ? htmlspecialchars(strip_tags($data['attn_to'])) : null;
            $status = isset($data['status']) ? htmlspecialchars(strip_tags($data['status'])) : 'draft';
            $description = isset($data['description']) ? htmlspecialchars(strip_tags($data['description'])) : null;
            $notes = isset($data['notes']) ? htmlspecialchars(strip_tags($data['notes'])) : null;
            $total_amount = isset($data['total_amount']) ? htmlspecialchars(strip_tags($data['total_amount'])) : 0;

            $stmt->bindParam(':proposal_name', $proposal_name);
            $stmt->bindParam(':client_id', $client_id);
            $stmt->bindParam(':attn_to', $attn_to);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':notes', $notes);
            $stmt->bindParam(':total_amount', $total_amount);
            $stmt->bindParam(':id', $id);

            // Execute query
            if ($stmt->execute()) {
                return array(
                    "status" => "success",
                    "message" => "Proposal updated successfully"
                );
            } else {
                return array(
                    "status" => "error",
                    "message" => "Failed to update proposal"
                );
            }
        } catch (PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error updating proposal: " . $e->getMessage()
            );
        }
    }


    public function updateOnlyStatus($id, $status)
    {
        try {
            $query = "UPDATE proposals SET status = :status, updated_at = NOW() WHERE proposal_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            return array(
                "status" => "success",
                "message" => "Proposal status updated successfully"
            );
        } catch (PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error updating proposal status: " . $e->getMessage()
            );
        }
    }

    // Update proposal status
    public function updateStatus($id, $data)
    {
        try {
            // Create query
            $query = "UPDATE proposals 
                      SET status = :status,
                          notes = :notes,
                          response_date = :response_date,
                          updated_at = NOW()
                      WHERE proposal_id = :id";

            // Prepare statement
            $stmt = $this->conn->prepare($query);

            // Sanitize data
            $status = htmlspecialchars(strip_tags($data['status']));
            $notes = htmlspecialchars(strip_tags($data['notes']));
            $responseDate = htmlspecialchars(strip_tags($data['response_date']));

            // Bind data
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':notes', $notes);
            $stmt->bindParam(':response_date', $responseDate);
            $stmt->bindParam(':id', $id);

            // Execute query
            if ($stmt->execute()) {
                return array(
                    "success" => true,
                    "message" => "Proposal status updated successfully."
                );
            }

            return array(
                "success" => false,
                "message" => "Failed to update proposal status."
            );

        } catch (PDOException $e) {
            return array(
                "success" => false,
                "message" => "Database error: " . $e->getMessage()
            );
        }
    }

    // Delete proposal
    public function delete($id)
    {
        try {
            // Create query
            $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";

            // Prepare statement
            $stmt = $this->conn->prepare($query);

            // Bind ID
            $stmt->bindParam(1, $id);

            // Execute query
            if ($stmt->execute()) {
                return array(
                    "status" => "success",
                    "message" => "Proposal deleted successfully"
                );
            } else {
                return array(
                    "status" => "error",
                    "message" => "Failed to delete proposal"
                );
            }
        } catch (PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error deleting proposal: " . $e->getMessage()
            );
        }
    }

    // Generate proposal document
    public function generateDocument($id)
    {
        try {
            // Get proposal data
            $query = "SELECT p.*, c.client_name 
                     FROM " . $this->table_name . " p
                     LEFT JOIN clients c ON p.client_id = c.client_id
                     WHERE p.proposal_id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                throw new Exception("Proposal not found");
            }

            $proposal = $stmt->fetch(PDO::FETCH_ASSOC);

            // Get company info
            $query = "SELECT * FROM company_info LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                throw new Exception("Company info not found");
            }

            $companyInfo = $stmt->fetch(PDO::FETCH_ASSOC);

            // Get services for this proposal
            $query = "SELECT ps.*, s.service_name, sc.service_category_name 
                     FROM pro_services ps
                     LEFT JOIN services s ON ps.service_id = s.service_id
                     LEFT JOIN service_categories sc ON s.service_category_id = sc.service_category_id
                     WHERE ps.proposal_id = :proposal_id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":proposal_id", $id);
            $stmt->execute();

            $services = array();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($services, $row);
            }

            // Get client info
            $query = "SELECT * FROM clients WHERE client_id = :client_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":client_id", $proposal['client_id']);
            $stmt->execute();
            $client = $stmt->fetch(PDO::FETCH_ASSOC);

            // Prepare document data
            $documentData = array(
                "company_info" => $companyInfo,
                "proposal" => $proposal,
                "client" => $client,
                "services" => $services
            );

            return array(
                "status" => "success",
                "data" => $documentData
            );

        } catch (Exception $e) {
            return array(
                "status" => "error",
                "message" => $e->getMessage()
            );
        }
    }

    // Get proposal document
    public function getDocument($id)
    {
        return $this->generateDocument($id);
    }

    // Save proposal as draft
    public function saveDraft($data)
    {
        try {
            $data['status'] = 'Draft';
            $result = $this->create($data);

            if ($result['status'] === 'success') {
                return array(
                    "success" => true,
                    "message" => "Proposal saved as draft",
                    "id" => $result['id']
                );
            } else {
                return array(
                    "success" => false,
                    "message" => $result['message']
                );
            }
        } catch (Exception $e) {
            return array(
                "success" => false,
                "message" => $e->getMessage()
            );
        }
    }

    // Get last proposal reference
    public function getLastReference()
    {
        try {
            $query = "SELECT proposal_reference 
                     FROM " . $this->table_name . " 
                     WHERE proposal_reference LIKE CONCAT('PRO-', YEAR(CURDATE()), '-%')
                     ORDER BY proposal_id DESC 
                     LIMIT 1";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                return array(
                    "status" => "success",
                    "data" => $row['proposal_reference']
                );
            } else {
                return array(
                    "status" => "success",
                    "data" => null
                );
            }
        } catch (PDOException $e) {
            return array(
                "status" => "error",
                "message" => "Error getting last reference: " . $e->getMessage()
            );
        }
    }
}