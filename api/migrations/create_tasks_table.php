<?php
require_once '../config/database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// SQL to create table
$sql = "CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    liaison_id INT NOT NULL,
    service_id INT,
    description TEXT NOT NULL,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (liaison_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

// Execute query
if($db->exec($sql)) {
    echo "Table 'tasks' created successfully.";
} else {
    echo "Error creating table: " . print_r($db->errorInfo(), true);
}
?> 