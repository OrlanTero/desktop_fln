<?php
require_once '../config/database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// SQL to create task_submission_attachments table
$sql = "CREATE TABLE IF NOT EXISTS task_submission_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES task_submissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

// Execute query
if($db->exec($sql)) {
    echo "Table 'task_submission_attachments' created successfully.";
} else {
    echo "Error creating table: " . print_r($db->errorInfo(), true);
}
?> 