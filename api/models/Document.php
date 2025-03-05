<?php
class Document {
    private $conn;
    private $table = 'documents';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table . " 
                  (proposal_id, file_path, file_name, file_type) 
                  VALUES (:proposal_id, :file_path, :file_name, :file_type)";

        try {
            error_log("Document::create - Starting document creation");
            error_log("Document::create - Query: " . $query);
            error_log("Document::create - Data: " . json_encode($data));
            
            $stmt = $this->conn->prepare($query);

            // Sanitize inputs
            $proposal_id = htmlspecialchars(strip_tags($data->proposal_id));
            $file_path = htmlspecialchars(strip_tags($data->file_path));
            $file_name = htmlspecialchars(strip_tags($data->file_name));
            $file_type = htmlspecialchars(strip_tags($data->file_type));

            error_log("Document::create - Sanitized values:");
            error_log("Document::create - proposal_id: " . $proposal_id);
            error_log("Document::create - file_path: " . $file_path);
            error_log("Document::create - file_name: " . $file_name);
            error_log("Document::create - file_type: " . $file_type);

            // Bind parameters
            $stmt->bindParam(':proposal_id', $proposal_id);
            $stmt->bindParam(':file_path', $file_path);
            $stmt->bindParam(':file_name', $file_name);
            $stmt->bindParam(':file_type', $file_type);

            if ($stmt->execute()) {
                $result = array(
                    'success' => true,
                    'data' => array(
                        'document_id' => $this->conn->lastInsertId(),
                        'file_path' => $file_path
                    )
                );
                error_log("Document::create - Success: " . json_encode($result));
                return $result;
            }
            
            error_log("Document::create - Failed to execute query");
            return array('success' => false, 'message' => 'Failed to create document');
        } catch (Exception $e) {
            error_log("Document::create - Exception: " . $e->getMessage());
            return array('success' => false, 'message' => $e->getMessage());
        }
    }

    public function getByProposal($proposalId) {
        $query = "SELECT * FROM " . $this->table . " WHERE proposal_id = :proposal_id";
        
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':proposal_id', $proposalId);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($result) {
                return array('success' => true, 'data' => $result);
            }
            return array('success' => false, 'message' => 'No document found', 'proposal_id' => $proposalId, 'query' => $query);
        } catch (Exception $e) {
            return array('success' => false, 'message' => $e->getMessage());
        }
    }


    public function delete($documentId) {
        $query = "DELETE FROM " . $this->table . " WHERE document_id = :document_id";
        
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':document_id', $documentId);
            
            if ($stmt->execute()) {
                return array('success' => true);
            }
            return array('success' => false, 'message' => 'Failed to delete document');
        } catch (Exception $e) {
            return array('success' => false, 'message' => $e->getMessage());
        }
    }
} 