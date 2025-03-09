<?php
require_once 'config/database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// SQL to alter table
$sql = "ALTER TABLE tasks 
        MODIFY COLUMN status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'SUBMITTED') NOT NULL DEFAULT 'PENDING'";

// Execute query
if($db->exec($sql)) {
    echo "Table 'tasks' altered successfully to include SUBMITTED status.";
} else {
    echo "Error altering table: " . print_r($db->errorInfo(), true);
}
?> 