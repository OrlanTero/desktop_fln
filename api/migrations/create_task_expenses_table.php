<?php
require_once '../config/database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// SQL to create task_expenses table
$sql = "CREATE TABLE IF NOT EXISTS task_expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES task_submissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

// Execute query
if($db->exec($sql)) {
    echo "Table 'task_expenses' created successfully.";
} else {
    echo "Error creating table: " . print_r($db->errorInfo(), true);
}
?> 