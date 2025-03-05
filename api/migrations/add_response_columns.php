<?php
require_once __DIR__ . '/../config/Database.php';

try {
    // Create database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Add response_date column if it doesn't exist
    $query = "ALTER TABLE proposals 
              ADD COLUMN IF NOT EXISTS response_date DATETIME NULL,
              MODIFY COLUMN notes TEXT NULL";
    
    $stmt = $db->prepare($query);
    
    if ($stmt->execute()) {
        echo "Migration successful: Added response_date column and modified notes column.\n";
    } else {
        echo "Error executing migration.\n";
    }
    
} catch(PDOException $e) {
    echo "Database Error: " . $e->getMessage() . "\n";
}
?> 