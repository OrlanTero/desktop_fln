<?php
require_once '../config/database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// SQL to create task_submissions table
$sql = "CREATE TABLE IF NOT EXISTS task_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    liaison_id INT NOT NULL,
    notes TEXT,
    expenses_data TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (liaison_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

// Execute query
if($db->exec($sql)) {
    echo "Table 'task_submissions' created successfully.";
} else {
    echo "Error creating table: " . print_r($db->errorInfo(), true);
}
?> 