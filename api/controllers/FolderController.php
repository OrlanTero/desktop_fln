<?php
require_once __DIR__ . '/../models/Folder.php';

class FolderController
{
    private $folder;

    public function __construct($db)
    {
        $this->folder = new Folder($db);
    }

    /**
     * Get all folders
     * 
     * @return array Response
     */
    public function getAll()
    {
        error_log("FolderController::getAll - Getting all folders");
        $result = $this->folder->getAll();

        if ($result['success']) {
            return array(
                'status' => 'success',
                'data' => $result['data']
            );
        }

        return array(
            'status' => 'error',
            'message' => $result['message'] ?? 'Failed to get folders'
        );
    }

    /**
     * Get folders by parent ID
     * 
     * @param int|null $parentId Parent folder ID or null for root folders
     * @return array Response
     */
    public function getByParent($parentId = null)
    {
        error_log("FolderController::getByParent - Getting folders with parent_id: " . ($parentId ?? 'NULL'));
        $result = $this->folder->getByParent($parentId);

        if ($result['success']) {
            return array(
                'status' => 'success',
                'data' => $result['data']
            );
        }

        return array(
            'status' => 'error',
            'message' => $result['message'] ?? 'Failed to get folders'
        );
    }

    /**
     * Get folder by ID
     * 
     * @param int $folderId Folder ID
     * @return array Response
     */
    public function getById($folderId)
    {
        error_log("FolderController::getById - Getting folder with ID: $folderId");
        $result = $this->folder->getById($folderId);

        if ($result['success']) {
            return array(
                'status' => 'success',
                'data' => $result['data']
            );
        }

        return array(
            'status' => 'error',
            'message' => $result['message'] ?? 'Failed to get folder'
        );
    }

    /**
     * Create a new folder
     * 
     * @param array $requestData Request data
     * @param int $userId User ID from auth
     * @return array Response
     */
    public function create($requestData, $userId)
    {
        error_log("FolderController::create - Creating new folder");

        // Validate request data
        if (!isset($requestData['name']) || empty(trim($requestData['name']))) {
            return array(
                'status' => 'error',
                'message' => 'Folder name is required'
            );
        }

        // Create folder data object
        $folderData = (object) array(
            'name' => trim($requestData['name']),
            'parent_folder_id' => isset($requestData['parent_folder_id']) ? $requestData['parent_folder_id'] : null,
            'user_id' => $userId
        );

        error_log("FolderController::create - Folder data: " . json_encode($folderData));

        // Create folder
        $result = $this->folder->create($folderData);

        if ($result['success']) {
            return array(
                'status' => 'success',
                'message' => $result['message'] ?? 'Folder created successfully',
                'data' => $result['data']
            );
        }

        return array(
            'status' => 'error',
            'message' => $result['message'] ?? 'Failed to create folder'
        );
    }

    /**
     * Update a folder
     * 
     * @param int $folderId Folder ID
     * @param array $requestData Request data
     * @param int $userId User ID from auth
     * @return array Response
     */
    public function update($folderId, $requestData, $userId)
    {
        error_log("FolderController::update - Updating folder with ID: $folderId");

        // Validate request data
        if (!isset($requestData['name']) || empty(trim($requestData['name']))) {
            return array(
                'status' => 'error',
                'message' => 'Folder name is required'
            );
        }

        // Check if folder exists and user has permission
        $folderCheck = $this->folder->getById($folderId);
        if (!$folderCheck['success']) {
            return array(
                'status' => 'error',
                'message' => 'Folder not found'
            );
        }

        // Optional: Check if user has permission to update this folder
        // if ($folderCheck['data']['user_id'] != $userId) {
        //     return array(
        //         'status' => 'error',
        //         'message' => 'You do not have permission to update this folder'
        //     );
        // }

        // Create folder data object
        $folderData = (object) array(
            'name' => trim($requestData['name']),
            'parent_folder_id' => isset($requestData['parent_folder_id']) ? $requestData['parent_folder_id'] : null
        );

        // Update folder
        $result = $this->folder->update($folderId, $folderData);

        if ($result['success']) {
            return array(
                'status' => 'success',
                'message' => $result['message'] ?? 'Folder updated successfully',
                'data' => $result['data'] ?? null
            );
        }

        return array(
            'status' => 'error',
            'message' => $result['message'] ?? 'Failed to update folder'
        );
    }

    /**
     * Delete a folder
     * 
     * @param int $folderId Folder ID
     * @param int $userId User ID from auth
     * @return array Response
     */
    public function delete($folderId, $userId)
    {
        error_log("FolderController::delete - Deleting folder with ID: $folderId");

        // Check if folder exists and user has permission
        $folderCheck = $this->folder->getById($folderId);
        if (!$folderCheck['success']) {
            return array(
                'status' => 'error',
                'message' => 'Folder not found'
            );
        }

        // Optional: Check if user has permission to delete this folder
        // if ($folderCheck['data']['user_id'] != $userId) {
        //     return array(
        //         'status' => 'error',
        //         'message' => 'You do not have permission to delete this folder'
        //     );
        // }

        // Delete folder
        $result = $this->folder->delete($folderId);

        if ($result['success']) {
            return array(
                'status' => 'success',
                'message' => $result['message'] ?? 'Folder deleted successfully'
            );
        }

        return array(
            'status' => 'error',
            'message' => $result['message'] ?? 'Failed to delete folder'
        );
    }
}