<?php
class Folder
{
    private $conn;
    private $table = 'folders';

    public function __construct($db)
    {
        $this->conn = $db;
    }

    /**
     * Create a new folder
     * @param object $data Folder data
     * @return array Result with success status and data
     */
    public function create($data)
    {
        $query = "INSERT INTO " . $this->table . " 
                  (parent_folder_id, name, user_id) 
                  VALUES (:parent_folder_id, :name, :user_id)";

        try {
            error_log("Folder::create - Starting folder creation");
            error_log("Folder::create - Data: " . json_encode($data));

            $stmt = $this->conn->prepare($query);

            // Sanitize inputs
            $parent_folder_id = $data->parent_folder_id === null ? null : htmlspecialchars(strip_tags($data->parent_folder_id));
            $name = htmlspecialchars(strip_tags($data->name));
            $user_id = htmlspecialchars(strip_tags($data->user_id));

            // Bind parameters
            if ($parent_folder_id === null) {
                $stmt->bindValue(':parent_folder_id', null, PDO::PARAM_NULL);
            } else {
                $stmt->bindParam(':parent_folder_id', $parent_folder_id);
            }
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':user_id', $user_id);

            if ($stmt->execute()) {
                $folder_id = $this->conn->lastInsertId();

                // Get the full folder data
                $folder = $this->getById($folder_id);

                if ($folder['success']) {
                    return array(
                        'success' => true,
                        'data' => $folder['data'],
                        'message' => 'Folder created successfully'
                    );
                }

                return array(
                    'success' => true,
                    'data' => array(
                        'folder_id' => $folder_id,
                        'name' => $name,
                        'parent_folder_id' => $parent_folder_id,
                        'user_id' => $user_id,
                        'created_at' => date('Y-m-d H:i:s')
                    ),
                    'message' => 'Folder created successfully'
                );
            }

            error_log("Folder::create - Failed to execute query");
            return array('success' => false, 'message' => 'Failed to create folder');
        } catch (Exception $e) {
            error_log("Folder::create - Exception: " . $e->getMessage());
            return array('success' => false, 'message' => $e->getMessage());
        }
    }

    /**
     * Get all folders
     * @return array Result with success status and data
     */
    public function getAll()
    {
        $query = "SELECT * FROM " . $this->table . " ORDER BY name ASC";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute();

            $folders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return array('success' => true, 'data' => $folders);
        } catch (Exception $e) {
            error_log("Folder::getAll - Exception: " . $e->getMessage());
            return array('success' => false, 'message' => $e->getMessage());
        }
    }

    /**
     * Get folders by parent folder ID
     * @param int|null $parentId Parent folder ID or null for root folders
     * @return array Result with success status and data
     */
    public function getByParent($parentId = null)
    {
        if ($parentId === null) {
            $query = "SELECT * FROM " . $this->table . " WHERE parent_folder_id IS NULL ORDER BY name ASC";
            $stmt = $this->conn->prepare($query);
        } else {
            $query = "SELECT * FROM " . $this->table . " WHERE parent_folder_id = :parent_id ORDER BY name ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':parent_id', $parentId);
        }

        try {
            $stmt->execute();
            $folders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return array('success' => true, 'data' => $folders);
        } catch (Exception $e) {
            error_log("Folder::getByParent - Exception: " . $e->getMessage());
            return array('success' => false, 'message' => $e->getMessage());
        }
    }

    /**
     * Get folder by ID
     * @param int $folderId Folder ID
     * @return array Result with success status and data
     */
    public function getById($folderId)
    {
        $query = "SELECT * FROM " . $this->table . " WHERE folder_id = :folder_id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':folder_id', $folderId);
            $stmt->execute();

            $folder = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($folder) {
                return array('success' => true, 'data' => $folder);
            }
            return array('success' => false, 'message' => 'Folder not found', 'folder_id' => $folderId);
        } catch (Exception $e) {
            error_log("Folder::getById - Exception: " . $e->getMessage());
            return array('success' => false, 'message' => $e->getMessage());
        }
    }

    /**
     * Update folder
     * @param int $folderId Folder ID
     * @param object $data Updated folder data
     * @return array Result with success status and data
     */
    public function update($folderId, $data)
    {
        $query = "UPDATE " . $this->table . " 
                  SET name = :name, 
                      parent_folder_id = :parent_folder_id,
                      updated_at = CURRENT_TIMESTAMP
                  WHERE folder_id = :folder_id";

        try {
            $stmt = $this->conn->prepare($query);

            // Sanitize inputs
            $name = htmlspecialchars(strip_tags($data->name));
            $parent_folder_id = $data->parent_folder_id === null ? null : htmlspecialchars(strip_tags($data->parent_folder_id));

            // Bind parameters
            $stmt->bindParam(':name', $name);
            if ($parent_folder_id === null) {
                $stmt->bindValue(':parent_folder_id', null, PDO::PARAM_NULL);
            } else {
                $stmt->bindParam(':parent_folder_id', $parent_folder_id);
            }
            $stmt->bindParam(':folder_id', $folderId);

            if ($stmt->execute()) {
                // Get updated folder
                $folder = $this->getById($folderId);
                if ($folder['success']) {
                    return array(
                        'success' => true,
                        'data' => $folder['data'],
                        'message' => 'Folder updated successfully'
                    );
                }

                return array(
                    'success' => true,
                    'message' => 'Folder updated successfully'
                );
            }

            return array('success' => false, 'message' => 'Failed to update folder');
        } catch (Exception $e) {
            error_log("Folder::update - Exception: " . $e->getMessage());
            return array('success' => false, 'message' => $e->getMessage());
        }
    }

    /**
     * Delete folder
     * @param int $folderId Folder ID
     * @return array Result with success status and data
     */
    public function delete($folderId)
    {
        // First check if folder has any subfolders or documents
        $subFoldersQuery = "SELECT COUNT(*) AS count FROM " . $this->table . " WHERE parent_folder_id = :folder_id";
        $documentsQuery = "SELECT COUNT(*) AS count FROM documents WHERE folder_id = :folder_id";

        try {
            // Check subfolders
            $stmt = $this->conn->prepare($subFoldersQuery);
            $stmt->bindParam(':folder_id', $folderId);
            $stmt->execute();
            $subFolderCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            if ($subFolderCount > 0) {
                return array(
                    'success' => false,
                    'message' => 'Cannot delete folder: contains subfolders. Delete subfolders first.'
                );
            }

            // Check documents
            $stmt = $this->conn->prepare($documentsQuery);
            $stmt->bindParam(':folder_id', $folderId);
            $stmt->execute();
            $documentCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            if ($documentCount > 0) {
                return array(
                    'success' => false,
                    'message' => 'Cannot delete folder: contains documents. Delete documents first.'
                );
            }

            // Delete the folder
            $query = "DELETE FROM " . $this->table . " WHERE folder_id = :folder_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':folder_id', $folderId);

            if ($stmt->execute()) {
                return array(
                    'success' => true,
                    'message' => 'Folder deleted successfully'
                );
            }

            return array('success' => false, 'message' => 'Failed to delete folder');
        } catch (Exception $e) {
            error_log("Folder::delete - Exception: " . $e->getMessage());
            return array('success' => false, 'message' => $e->getMessage());
        }
    }
}