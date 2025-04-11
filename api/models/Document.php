<?php
class Document
{
    private $conn;
    private $table = 'documents';

    public function __construct($db)
    {
        $this->conn = $db;
    }

    /**
     * Create a new document record
     * 
     * @param object $data Document data
     * @return array Result with success status and data
     */
    public function create($data)
    {
        $query = "INSERT INTO " . $this->table . " 
                  (proposal_id, file_path, file_name, file_type, folder_id, user_id, media_type) 
                  VALUES (:proposal_id, :file_path, :file_name, :file_type, :folder_id, :user_id, :media_type)";

        try {
            error_log("Document::create - Starting document creation");
            error_log("Document::create - Query: " . $query);
            error_log("Document::create - Data: " . json_encode($data));

            $stmt = $this->conn->prepare($query);

            // Sanitize inputs
            $proposal_id = isset($data->proposal_id) ? htmlspecialchars(strip_tags($data->proposal_id)) : null;
            $file_path = htmlspecialchars(strip_tags($data->file_path));
            $file_name = htmlspecialchars(strip_tags($data->file_name));
            $file_type = htmlspecialchars(strip_tags($data->file_type));
            $folder_id = isset($data->folder_id) ? htmlspecialchars(strip_tags($data->folder_id)) : null;
            $user_id = isset($data->user_id) ? htmlspecialchars(strip_tags($data->user_id)) : null;
            $media_type = isset($data->media_type) ? htmlspecialchars(strip_tags($data->media_type)) : 'document';

            error_log("Document::create - Sanitized values:");
            error_log("Document::create - proposal_id: " . ($proposal_id ?? 'NULL'));
            error_log("Document::create - file_path: " . $file_path);
            error_log("Document::create - file_name: " . $file_name);
            error_log("Document::create - file_type: " . $file_type);
            error_log("Document::create - folder_id: " . ($folder_id ?? 'NULL'));
            error_log("Document::create - user_id: " . ($user_id ?? 'NULL'));
            error_log("Document::create - media_type: " . $media_type);

            // Bind parameters
            if ($proposal_id === null) {
                $stmt->bindValue(':proposal_id', null, PDO::PARAM_NULL);
            } else {
                $stmt->bindParam(':proposal_id', $proposal_id);
            }
            $stmt->bindParam(':file_path', $file_path);
            $stmt->bindParam(':file_name', $file_name);
            $stmt->bindParam(':file_type', $file_type);

            if ($folder_id === null) {
                $stmt->bindValue(':folder_id', null, PDO::PARAM_NULL);
            } else {
                $stmt->bindParam(':folder_id', $folder_id);
            }

            if ($user_id === null) {
                $stmt->bindValue(':user_id', null, PDO::PARAM_NULL);
            } else {
                $stmt->bindParam(':user_id', $user_id);
            }

            $stmt->bindParam(':media_type', $media_type);

            if ($stmt->execute()) {
                $document_id = $this->conn->lastInsertId();

                // Get the created document
                $document = $this->getById($document_id);

                if ($document['success']) {
                    return array(
                        'success' => true,
                        'data' => $document['data']
                    );
                }

                $result = array(
                    'success' => true,
                    'data' => array(
                        'document_id' => $document_id,
                        'file_path' => $file_path,
                        'file_name' => $file_name,
                        'file_type' => $file_type,
                        'folder_id' => $folder_id,
                        'user_id' => $user_id,
                        'media_type' => $media_type,
                        'created_at' => date('Y-m-d H:i:s')
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

    /**
     * Get document by ID
     * 
     * @param int $documentId Document ID
     * @return array Result with success status and data
     */
    public function getById($documentId)
    {
        $query = "SELECT * FROM " . $this->table . " WHERE document_id = :document_id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':document_id', $documentId);
            $stmt->execute();

            $document = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($document) {
                return array('success' => true, 'data' => $document);
            }
            return array('success' => false, 'message' => 'Document not found');
        } catch (Exception $e) {
            error_log("Document::getById - Exception: " . $e->getMessage());
            return array('success' => false, 'message' => $e->getMessage());
        }
    }

    /**
     * Get documents by proposal ID
     * 
     * @param int $proposalId Proposal ID
     * @return array Result with success status and data
     */
    public function getByProposal($proposalId)
    {
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

    /**
     * Get documents by folder ID
     * 
     * @param int|null $folderId Folder ID or null for root documents
     * @return array Result with success status and data
     */
    public function getByFolder($folderId = null)
    {
        if ($folderId === null) {
            $query = "SELECT * FROM " . $this->table . " WHERE folder_id IS NULL ORDER BY file_name ASC";
            $stmt = $this->conn->prepare($query);
        } else {
            $query = "SELECT * FROM " . $this->table . " WHERE folder_id = :folder_id ORDER BY file_name ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':folder_id', $folderId);
        }

        try {
            $stmt->execute();
            $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return array('success' => true, 'data' => $documents);
        } catch (Exception $e) {
            error_log("Document::getByFolder - Exception: " . $e->getMessage());
            return array('success' => false, 'message' => $e->getMessage());
        }
    }

    /**
     * Get all documents
     * 
     * @return array Result with success status and data
     */
    public function getAll()
    {
        $query = "SELECT * FROM " . $this->table . " ORDER BY created_at DESC";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return array('success' => true, 'data' => $documents);
        } catch (Exception $e) {
            error_log("Document::getAll - Exception: " . $e->getMessage());
            return array('success' => false, 'message' => $e->getMessage());
        }
    }

    /**
     * Delete a document
     * 
     * @param int $documentId Document ID
     * @return array Result with success status and data
     */
    public function delete($documentId)
    {
        $query = "DELETE FROM " . $this->table . " WHERE document_id = :document_id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':document_id', $documentId);

            if ($stmt->execute()) {
                return array('success' => true);
            }
            return array('success' => false, 'message' => 'Failed to delete document');
        } catch (Exception $e) {
            error_log("Document::delete - Exception: " . $e->getMessage());
            return array('success' => false, 'message' => $e->getMessage());
        }
    }
}