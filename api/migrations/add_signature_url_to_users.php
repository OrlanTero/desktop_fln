<?php
// Migration: Add signature_url column to users table

// Include database config
require_once __DIR__ . '/../config/database.php';

// Create new database connection
$database = new Database();
$conn = $database->getConnection();

try {
    // Check if signature_url column already exists
    $checkColumnQuery = "SHOW COLUMNS FROM `users` LIKE 'signature_url'";
    $checkColumnStmt = $conn->prepare($checkColumnQuery);
    $checkColumnStmt->execute();

    if ($checkColumnStmt->rowCount() == 0) {
        // Add signature_url column to users table
        $sql = "ALTER TABLE `users` ADD COLUMN `signature_url` text DEFAULT NULL AFTER `photo_url`";
        $stmt = $conn->prepare($sql);
        $stmt->execute();

        echo "Column 'signature_url' added to 'users' table successfully.\n";
    } else {
        echo "Column 'signature_url' already exists in 'users' table.\n";
    }

    echo "Migration completed successfully.\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}