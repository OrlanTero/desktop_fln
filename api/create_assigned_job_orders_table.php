<?php
// Include database configuration
require_once 'config/database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Read SQL file
$sql = file_get_contents('sql/create_assigned_job_orders_table.sql');

// Execute SQL
try {
    $db->exec($sql);
    echo "Assigned job orders table created successfully\n";
} catch (PDOException $e) {
    echo "Error creating assigned job orders table: " . $e->getMessage() . "\n";
}
?> 